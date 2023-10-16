import { PluginModule, PluginPackage } from "@polywrap/plugin-js";

import { CoreClient } from "@polywrap/core-js";
import { Uri } from "@polywrap/client-js";
import Safe from "@safe-global/protocol-kit";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { SafeTransaction, SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { AddressBookPlugin } from "./AddressBook";


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

export type ArgsAddOwnerTx = {
  safeAddress: string;
  ownerAddress: string;
  newThreshold: number;
};

export type ArgsRemoveOwnerTx = ArgsAddOwnerTx;

export type ArgsChangeThresholdTx = {
  safeAddress: string;
  newThreshold: number;
};

export type ArgsEnableModule = {
  safeAddress: string;
  moduleAddress: string;
};
export type ArgsDisableModule = ArgsEnableModule;

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

export type ArgsDeploySafe = {
  owners: string[];
  threshold: number;
};

export type SafeTxPluginConfig = {
  ethAdapter: EthersAdapter;
};

export class SafeTxPlugin extends PluginModule<SafeTxPluginConfig> {
  async deploySafe(
    args: ArgsDeploySafe,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const deploySafeResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "deploySafe",
      args: {
        input: {
          safeAccountConfig: {
            owners: args.owners,
            threshold: args.threshold,
          },
        },
        txOptions: {
          gasLimit: "12000000",
        },
      },
    });

    if (!deploySafeResult.ok) {
      throw deploySafeResult.error;
    }

    return {
      safeAddress: deploySafeResult.value,
    };
  }

  async createTransaction(
    args: ArgsCreateTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const safeTransactionData: SafeTransactionDataPartial = {
      to: args.to,
      value: args.value,
      data: args.data
    }

    const safeSdk: Safe = await Safe.create({
      ethAdapter: this.config.ethAdapter,
      safeAddress: args.safeAddress,
    });
    const safeTransaction = await safeSdk.createTransaction({ safeTransactionData })
    const txHash = await safeSdk.getTransactionHash(safeTransaction)

    const cache = new AddressBookPlugin({})
    cache.set({key: txHash, value: JSON.stringify(safeTransaction)});

    const signedSafeTransaction = await safeSdk.signTransaction(safeTransaction);

    const signerAddrResult = await client.invoke<any>({
      uri: new Uri("wrapscan.io/polywrap/ethers@1.1.1"),
      method: "getSignerAddress",
      args: {},
    });

    if (!signerAddrResult.ok) {
      throw signerAddrResult.error;
    }

    const signerAddr = signerAddrResult.value;

    const proposedTx = await client.invoke<any>({
      uri: new Uri("plugin/safe-api-kit@1.0"),
      method: "proposeTransaction",
      args: {
        safeAddress: args.safeAddress,
        safeTransactionData: safeTransaction,
        safeTxHash: txHash,
        senderAddress: signerAddr,
        senderSignature: signedSafeTransaction.signatures.get(signerAddr)!.data,
        origin: "https://daata-unblock.vercel.app/"
      },
    });

    if (!proposedTx.ok) {
      throw proposedTx.error;
    }
    if (!proposedTx.value) {
      throw "failed to propose transaction!"
    }

    return {
      safeTxHash: txHash,
      signature: signedSafeTransaction.signatures.get(signerAddr)!.data,
    }
    // const txHash = await safeSdk.getTransactionHash(safeTransaction)
    // const approveTxResponse = await safeSdk.approveTransactionHash(txHash)
    // const receipt = await approveTxResponse.transactionResponse?.wait()

    // return {
    //   safeTxHash: txHash,
    //   txReceipt: receipt 
    // }

    // const signedSafeTransaction = await safeSdk.signTransaction(safeTransaction)

    // return signedSafeTransaction;
    // const connection = await this._getConnection(client);
    // const _env = {
    //   safeAddress: args.safeAddress,
    //   connection,
    // };
    // const safeTransactionResult = await client.invoke<{
    //   data: SafeTransaction;
    // }>({
    //   uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
    //   method: "createTransaction",
    //   args: {
    //     tx: {
    //       to: args.to,
    //       value: args.value,
    //       data: args.data,
    //     },
    //   },
    //   env: _env,
    // });

    // if (!safeTransactionResult.ok) {
    //   throw safeTransactionResult.error;
    // }

    // const txHashResult = await client.invoke<string>({
    //   uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
    //   method: "getTransactionHash",
    //   args: {
    //     tx: safeTransactionResult.value.data,
    //   },
    //   env: _env,
    // });

    // if (!txHashResult.ok) {
    //   throw txHashResult.error;
    // }

    // return await client.invoke<unknown>({
    //   uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
    //   method: "addSignature",
    //   args: {
    //     data: safeTransactionResult.value.data,
    //   },
    //   env: _env
    // });

    // const safeSdk: Safe = await Safe.create({
    //   ethAdapter: this.config.ethAdapter,
    //   safeAddress: args.safeAddress,
    // });

    // console.log(safeTransactionResult.value.data)

    // const txn = await safeSdk.signTransaction(safeTransactionResult.value.data);

    // return txn;
  }

  async signTransaction(
    args: ArgsSignTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    throw "not implemented"
    // const connection = await this._getConnection(client);
    // const _env = {
    //   safeAddress: args.safeAddress,
    //   connection: connection,
    // };

    // const safeSdk: Safe = await Safe.create({
    //   ethAdapter: this.config.ethAdapter,
    //   safeAddress: args.safeAddress,
    // });

    // const cache = new AddressBookPlugin({})

    // const safeTransaction = await cache.get({key: args.safeTxHash});
    // const signedTx = await safeSdk.signTransaction(safeTransaction);

    // signedTx.signatures

    // const approveTxResponse = await safeSdk.approveTransactionHash(args.safeTxHash)
    // const receipt = await approveTxResponse.transactionResponse?.wait()

    // return {
    //   txReceipt: receipt 
    // }

    // const signature = await safeSdk.signTransactionHash(args.safeTxHash);

    // const signatureResult = await client.invoke<Signature>({
    //   uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
    //   method: "signTransactionHash",
    //   args: {
    //     hash: args.safeTxHash,
    //   },
    //   env: _env,
    // });

    // if (!signatureResult.ok) {
    //   throw signatureResult.error;
    // }

    // const signature = signatureResult.value;

    // const confirmedSignatureResult = await client.invoke<string>({
    //   uri: new Uri("plugin/safe-api-kit@1.0"),
    //   method: "confirmTransaction",
    //   args: {
    //     safeTxHash: args.safeTxHash,
    //     signature: signature.data,
    //   },
    // });

    // if (!confirmedSignatureResult.ok) {
    //   throw confirmedSignatureResult.error;
    // }

    // return {
    //   signature: confirmedSignatureResult.value,
    // };
  }

  async executeTransaction(
    args: ArgsExecuteTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ): Promise<any> {
    throw "not implemented"
    // const safeSdk: Safe = await Safe.create({
    //   ethAdapter: this.config.ethAdapter,
    //   safeAddress: args.safeAddress,
    // });
    
    // const txResponse = await safeSdk.executeTransaction(safeTransaction)
    // await txResponse.transactionResponse?.wait()
    // const connection = await this._getConnection(client);
    // const _env = {
    //   safeAddress: args.safeAddress,
    //   connection: connection,
    // };

    // const txResult = await client.invoke<SafeMultisigTransactionResponse>({
    //   uri: new Uri("plugin/safe-api-kit@1.0"),
    //   method: "getTransaction",
    //   args: {
    //     safeTxHash: args.safeTxHash,
    //   },
    // });

    // if (!txResult.ok) {
    //   throw txResult.error;
    // }

    // const tx: SafeMultisigTransactionResponse = txResult.value;
    // const signatures: Map<string, Signature> = new Map();
    // if (!tx.confirmations) {
    //   throw `No signatures found for the transaction with hash: ${args.safeTxHash}, require: ${tx.confirmationsRequired}`;
    // }
    // for (const confirmation of tx.confirmations) {
    //   signatures.set(confirmation.owner, {
    //     signer: confirmation.owner,
    //     data: confirmation.signature,
    //   });
    // }

    // const txData = {
    //   to: tx.to,
    //   value: tx.value,
    //   data: tx.data,
    //   operation: tx.operation,
    //   safeTxGas: tx.safeTxGas,
    //   baseGas: tx.baseGas,
    //   gasPrice: tx.gasPrice,
    //   gasToken: tx.gasToken,
    //   refundReceiver: tx.refundReceiver,
    //   nonce: tx.nonce,
    // };

    // const executeTxResult = await client.invoke<any>({
    //   uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
    //   method: "executeTransaction",
    //   args: {
    //     tx: {
    //       signatures,
    //       data: txData,
    //     },
    //     options: {
    //       gasLimit: "12000000",
    //     },
    //   },
    //   env: _env,
    // });

    // if (!executeTxResult.ok) {
    //   throw executeTxResult.error;
    // }

    // return executeTxResult.value;
  }

  async addOwner(
    args: ArgsAddOwnerTx,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const encodeAddOwnerWithThresholdDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeAddOwnerWithThresholdData",
      args: {
        ownerAddress: args.ownerAddress,
        threshold: args.newThreshold,
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!encodeAddOwnerWithThresholdDataResult.ok) {
      return encodeAddOwnerWithThresholdDataResult;
    }

    return await this.createTransaction(
      {
        safeAddress: args.safeAddress,
        to: args.safeAddress,
        data: encodeAddOwnerWithThresholdDataResult.value,
        value: "0",
      },
      client,
      env,
      uri
    );
  }

  async removeOwner(
    args: ArgsRemoveOwnerTx,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const encodeRemoveOwnerDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeRemoveOwnerData",
      args: {
        ownerAddress: args.ownerAddress,
        threshold: args.newThreshold,
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!encodeRemoveOwnerDataResult.ok) {
      return encodeRemoveOwnerDataResult;
    }

    return await this.createTransaction(
      {
        safeAddress: args.safeAddress,
        to: args.safeAddress,
        data: encodeRemoveOwnerDataResult.value,
        value: "0",
      },
      client,
      env,
      uri
    );
  }

  async changeThreshold(
    args: ArgsChangeThresholdTx,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const encodeChangeThresholdDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeChangeThresholdData",
      args: {
        threshold: args.newThreshold,
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!encodeChangeThresholdDataResult.ok) {
      return encodeChangeThresholdDataResult;
    }

    return await this.createTransaction(
      {
        safeAddress: args.safeAddress,
        to: args.safeAddress,
        data: encodeChangeThresholdDataResult.value,
        value: "0",
      },
      client,
      env,
      uri
    );
  }

  async enableModule(
    args: ArgsEnableModule,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const encodeEnableModuleDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeEnableModuleData",
      args: {
        moduleAddress: args.moduleAddress,
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!encodeEnableModuleDataResult.ok) {
      return encodeEnableModuleDataResult;
    }

    return await this.createTransaction(
      {
        safeAddress: args.safeAddress,
        to: args.safeAddress,
        data: encodeEnableModuleDataResult.value,
        value: "0",
      },
      client,
      env,
      uri
    );
  }

  async disableModule(
    args: ArgsDisableModule,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const encodeDisableModuleDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeDisableModuleData",
      args: {
        moduleAddress: args.moduleAddress,
      },
      env: {
        safeAddress: args.safeAddress,
      },
    });

    if (!encodeDisableModuleDataResult.ok) {
      return encodeDisableModuleDataResult;
    }

    return await this.createTransaction(
      {
        safeAddress: args.safeAddress,
        to: args.safeAddress,
        data: encodeDisableModuleDataResult.value,
        value: "0",
      },
      client,
      env,
      uri
    );
  }

  async _getConnection(client: CoreClient): Promise<any> {
    const chainIdResult = await client.invoke<string>({
      uri: new Uri("wrap://wrapscan.io/polywrap/ethers@1.1.1"),
      method: "getChainId",
      args: {},
    });
    if (!chainIdResult.ok) {
      throw chainIdResult.error;
    }
    if (chainIdResult.value == "100") {
      return { node: "https://gnosis.drpc.org" };
    }
    return { networkNameOrChainId: chainIdResult.value };
  }
}

export const makeSafeTxPlugin = (config: SafeTxPluginConfig) => {
  return PluginPackage.from(new SafeTxPlugin(config), {
    name: "safe-tx-plugin",
    type: "plugin",
    version: "0.1.0",
    abi: {},
  });
};
