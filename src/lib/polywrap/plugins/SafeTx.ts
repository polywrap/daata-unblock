import { API_URL } from "@/constants";
import http from "@/lib/http";
import { PluginModule, PluginPackage } from "@polywrap/plugin-js";
import { CoreClient, InvokeResult } from "@polywrap/core-js";

export interface Log {
  blockNumber: bigint;
  blockHash: string;
  transactionIndex: number;
  removed: boolean;
  address: string;
  data: string;
  topics: string[];
  transactionHash: string;
  logIndex: number;
}


export interface Ethers_TxReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  root?: string | null;
  gasUsed: bigint;
  logsBloom: string;
  transactionHash: string;
  logs: Log[];
  blockNumber: bigint;
  blockHash: string;
  confirmations: number;
  cumulativeGasUsed: bigint;
  effectiveGasPrice: bigint;
  type: number;
  status?: number | null;
}


export type ArgsCreateTransaction = {
  safeAddress: string;
  to: string;
  data: string;
  value: string;
};

export type ArgsSignTransaction = {
  safeAddress: string;
  safeTxHash: string;
};

export type ArgsExecuteTransaction = ArgsSignTransaction;

export type Signature = {
  signer: string;
  data: string;
};

export interface SafeMultisigConfirmationResponse {
  owner: string;
  submissionDate: string;
  transactionHash?: string | null;
  confirmationType?: string | null;
  signature: string;
  signatureType?: string | null;
}

export interface SafeMultisigTransactionResponse {
  safe: string;
  to: string;
  value: string;
  data?: string | null;
  operation: number;
  gasToken: string;
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  refundReceiver?: string | null;
  nonce: number;
  executionDate: string;
  submissionDate: string;
  modified: string;
  blockNumber?: number | null;
  transactionHash: string;
  safeTxHash: string;
  executor?: string | null;
  isExecuted: boolean;
  isSuccessful?: boolean | null;
  ethGasPrice?: string | null;
  gasUsed?: number | null;
  fee?: string | null;
  origin: string;
  dataDecoded?: string | null;
  confirmationsRequired: number;
  confirmations?: SafeMultisigConfirmationResponse[] | null;
  trusted: boolean;
  signatures?: string | null;
}

export class SafeTxPlugin extends PluginModule<{}> {
  async createTransaction(
    args: ArgsCreateTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ): Promise<InvokeResult<string>> {
    const safeTransactionResult = await client.invoke({
      uri: "wrapscan.io/polywrap/protocol-kit@0.1.0",
      method: "createTransaction",
      args: {
        tx: {
          to: args.to,
          value: args.value,
          data: args.data,
        },
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!safeTransactionResult.ok) {
      return safeTransactionResult;
    }

    const txHashResult = await client.invoke<string>({
      uri: "wrapscan.io/polywrap/protocol-kit@0.1.0",
      method: "getTransactionHash",
      args: {
        tx: safeTransactionResult.value,
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!txHashResult.ok) {
      return txHashResult;
    }

    await this.signTransaction(
      {
        safeAddress: args.safeAddress,
        safeTxHash: txHashResult.value,
      },
      client,
      env,
      uri
    );

    return txHashResult;
  }

  async signTransaction(
    args: ArgsSignTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const signatureResult = await client.invoke<Signature>({
      uri: "wrapscan.io/polywrap/protocol-kit@0.1.0",
      method: "signTransactionHash",
      args: {
        hash: args.safeTxHash,
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!signatureResult.ok) {
      return signatureResult;
    }

    const signature = signatureResult.value;

    const confirmedSignatureResult = await client.invoke<string>({
      uri: "plugin/safe-api-kit@1.0",
      method: "confirmTransaction",
      args: {
        safeTxHash: args.safeTxHash,
        signature: signature.data,
      },
    });

    return confirmedSignatureResult;
  }

  async executeTransaction(
    args: ArgsExecuteTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ): InvokeResult<Ethers_TxReceipt> {
    const txResult = await client.invoke<SafeMultisigTransactionResponse>({
      uri: "plugin/safe-api-kit@1.0",
      method: "getTransaction",
      args: {
        safeTxHash: args.safeTxHash,
      },
    });

    if (!txResult) {
      return txResult;
    }

    const tx: SafeMultisigTransactionResponse = txResult.value;
    const signatures: Map<string, Signature> = new Map();
    if (!tx.confirmations) {
      return {
        ok: false,
        error: `No signatures found for the transaction with hash: ${args.safeTxHash}, require: ${tx.confirmationsRequired}`,
      };
    }
    for (const confirmation of tx.confirmations) {
      signatures.set(confirmation.owner, {
        signer: confirmation.owner,
        data: confirmation.signature,
      });
    }

    const txData = {
      to: tx.to,
      value: tx.value,
      data: tx.data,
      operation: tx.operation,
      safeTxGas: tx.safeTxGas,
      baseGas: tx.baseGas,
      gasPrice: tx.gasPrice,
      gasToken: tx.gasToken,
      refundReceiver: tx.refundReceiver,
      nonce: tx.nonce
    }

    const executeTxResult = await client.invoke<SafeMultisigConfirmationResponse>({
      uri: "wrapscan.io/polywrap/protocol-kit@0.1.0",
      method: "executeTransaction",
      args: {
        tx: {
          signatures,
          data: txData,
        }
      }
    });

    return executeTxResult;
  }

  // async addOwner(args: { ownerAddress: string; newThreshold: number }) {
  //   return "safeTxHash";
  // }

  // async removeOwner(args: { ownerAddress: string; newThreshold: number }) {
  //   return "safeTxHash";
  // }

  // async changeThreshold(args: { newThreshold: number }) {
  //   return "safeTxHash";
  // }
}

export const makeSafeTxPlugin = () => {
  return PluginPackage.from(new SafeTxPlugin(), {
    name: "safe-tx-plugin",
    type: "plugin",
    version: "0.1.0",
    abi: {},
  });
};
