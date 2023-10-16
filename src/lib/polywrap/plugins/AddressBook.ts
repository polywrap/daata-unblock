import { API_URL } from "@/constants";
import http from "@/lib/http";
import { PluginModule, PluginPackage } from "@polywrap/plugin-js";

// interface AddressEntryDTO {
//   id: string;
//   name: string;
//   address: string;
// }

export class AddressBookPlugin extends PluginModule<{}> {
  async get(args: { key: string }) {
    const { data } = await http.get<any>(
      `addressBook/${args.key}`
    );

    if (!data) {
      return null;
    }

    return data;
  }

  async set(args: { key: string; value: string }) {
    const { data } = await http.post<unknown>(`addressBook`, {
      name: args.key,
      address: args.value,
    });

    return data;
  }
}

export const makeAddressBookPlugin = () => {
  return PluginPackage.from(new AddressBookPlugin({}), {
    name: "addressBook",
    type: "plugin",
    version: "0.1.0",
    abi: {},
  });
};
