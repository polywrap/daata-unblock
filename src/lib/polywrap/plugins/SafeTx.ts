import {
  EthersAdapter,
  SafeAccountConfig,
  SafeFactory,
} from "@safe-global/protocol-kit";
import { PluginModule, PluginPackage } from "@polywrap/plugin-js";

import { CoreClient } from "@polywrap/core-js";
import Safe from "@safe-global/protocol-kit";
import SafeAPIKit from "@safe-global/api-kit";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { Signer } from "ethers";
import { Uri } from "@polywrap/client-js";
import { ethers } from "ethers";

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

export type ArgsDeploySafe = {
  owners: string[];
  threshold: number;
};

export type SafeTxPluginConfig = {
  ethAdapter: EthersAdapter;
  txServiceUrl: string;
  signer: Signer;
};

export class SafeTxPlugin extends PluginModule<SafeTxPluginConfig> {
  async deploySafe(
    args: ArgsDeploySafe,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const safeFactory = await SafeFactory.create({
      ethAdapter: this.config.ethAdapter,
    });
    const safeAccountConfig: SafeAccountConfig = {
      owners: args.owners,
      threshold: args.threshold,
    };

    const safeSdk: Safe = await safeFactory.deploySafe({ safeAccountConfig });
    return await safeSdk.getAddress();
  }

  async createTransaction(
    args: ArgsCreateTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const safeTransactionData: SafeTransactionDataPartial = {
      to: ethers.utils.getAddress(args.to),
      value: args.value,
      data: args.data,
    };

    const safeSdk: Safe = await Safe.create({
      ethAdapter: this.config.ethAdapter,
      safeAddress: args.safeAddress,
    });
    const safeApi = new SafeAPIKit({
      txServiceUrl: this.config.txServiceUrl,
      ethAdapter: this.config.ethAdapter,
    });

    const safeTransaction = await safeSdk.createTransaction({
      safeTransactionData,
    });
    const txHash = await safeSdk.getTransactionHash(safeTransaction);

    console.log({ txHash, safeTransaction });

    const signedSafeTransaction = await safeSdk.signTransaction(
      safeTransaction
    );
    console.log(signedSafeTransaction);

    const signerAddrResult = await client.invoke<any>({
      uri: new Uri("wrapscan.io/polywrap/ethers@1.1.1"),
      method: "getSignerAddress",
      args: {},
    });

    console.log(signerAddrResult);

    if (!signerAddrResult.ok) {
      throw signerAddrResult.error;
    }
    const signerAddr = ethers.utils.getAddress(signerAddrResult.value);

    const proposeTransactionArgs = {
      safeAddress: args.safeAddress,
      safeTransactionData: safeTransaction.data,
      safeTxHash: txHash,
      senderAddress: signerAddr,
      senderSignature: signedSafeTransaction.signatures.get(
        signerAddr.toLowerCase()
      )!.data,
      origin: "https://daata-unblock.vercel.app/",
    };

    console.log(proposeTransactionArgs);
    await safeApi.proposeTransaction(proposeTransactionArgs);

    return {
      safeTxHash: txHash,
      signature: signedSafeTransaction.signatures.get(signerAddr.toLowerCase())!
        .data,
    };
  }

  async signTransaction(
    args: ArgsSignTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const safeSdk: Safe = await Safe.create({
      ethAdapter: this.config.ethAdapter,
      safeAddress: args.safeAddress,
    });
    const safeApi = new SafeAPIKit({
      txServiceUrl: this.config.txServiceUrl,
      ethAdapter: this.config.ethAdapter,
    });

    const transaction = await safeApi.getTransaction(args.safeTxHash);
    console.log("tx", transaction);

    const result = await safeSdk.signTransaction(transaction);
    console.log("sign result", result);

    return {
      transactionHash: args.safeTxHash,
      signatures: Array.from(result.signatures.values()),
    };
  }

  async executeTransaction(
    args: ArgsExecuteTransaction,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ): Promise<any> {
    const safeSdk: Safe = await Safe.create({
      ethAdapter: this.config.ethAdapter,
      safeAddress: args.safeAddress,
    });
    const safeApi = new SafeAPIKit({
      txServiceUrl: this.config.txServiceUrl,
      ethAdapter: this.config.ethAdapter,
    });

    const transaction = await safeApi.getTransaction(args.safeTxHash);
    console.log("tx", transaction);

    const result = await safeSdk.executeTransaction(transaction);
    console.log("sign result", result);

    return {
      txHash: args.safeTxHash,
      txResponse: result.transactionResponse,
    };
  }

  async addOwner(
    args: ArgsAddOwnerTx,
    client: CoreClient,
    env?: Record<string, unknown>,
    uri?: string
  ) {
    const connection = await this._getConnection(client);
    const _env = {
      safeAddress: args.safeAddress,
      connection: connection,
    };
    const encodeAddOwnerWithThresholdDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeAddOwnerWithThresholdData",
      args: {
        ownerAddress: args.ownerAddress,
        threshold: args.newThreshold,
      },
      env: _env,
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
    const connection = await this._getConnection(client);
    const _env = {
      safeAddress: args.safeAddress,
      connection: connection,
    };
    const encodeRemoveOwnerDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeRemoveOwnerData",
      args: {
        ownerAddress: args.ownerAddress,
        threshold: args.newThreshold,
      },
      env: _env,
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
    const connection = await this._getConnection(client);
    const _env = {
      safeAddress: args.safeAddress,
      connection: connection,
    };
    const encodeChangeThresholdDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeChangeThresholdData",
      args: {
        threshold: args.newThreshold,
      },
      env: _env,
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
    const connection = await this._getConnection(client);
    const _env = {
      safeAddress: args.safeAddress,
      connection: connection,
    };
    const encodeEnableModuleDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeEnableModuleData",
      args: {
        moduleAddress: args.moduleAddress,
      },
      env: _env,
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
    const connection = await this._getConnection(client);
    const _env = {
      safeAddress: args.safeAddress,
      connection: connection,
    };
    const encodeDisableModuleDataResult = await client.invoke<string>({
      uri: new Uri("wrapscan.io/polywrap/protocol-kit@0.1.0"),
      method: "encodeDisableModuleData",
      args: {
        moduleAddress: args.moduleAddress,
      },
      env: _env,
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
