import { PluginModule, PluginPackage } from "@polywrap/plugin-js";

import http from "@/lib/http";

const GRAPH_API_URL = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

export interface DomainInfo {
  id: string;
  name: string;
  labelName: string;
  labelhash: string;
  owner: {
    id: string;
  };
  resolvedAddress: {
    id: string;
  };
  resolver: {
    id: string;
  };
}


export class EnsPlugin extends PluginModule<{}> {
  async getDomainInfo(args: { domain: string }) {
    const query = `
    {
      domains(where: {name: "${args.domain}"}) {
        id
        name
        labelName
        labelhash
        owner {
          id
        },
        resolvedAddress {
          id
        },
        resolver {
          id,
        }
      }
    }
  `;

    try {
      const response = await http.post(GRAPH_API_URL, {
        query,
      });

      if (response.data.errors) {
        throw new Error(
          `Error fetching data: ${response.data.errors[0].message}`
        );
      }

      return response.data.data.domains[0] as DomainInfo;
    } catch (error) {
      throw error;
    }
  }
}

export const makeEnsPlugin = () => {
  return PluginPackage.from(new EnsPlugin({}), {
    name: "ens",
    type: "plugin",
    version: "0.1.0",
    abi: {},
  });
};
