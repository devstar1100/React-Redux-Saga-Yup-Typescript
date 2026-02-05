export enum Network {
  Mainnet = "Mainnet",
  Preprod = "Preprod",
  Preview = "Preview",
  Testnet = "Testnet",
}

export interface Project {
  id: number;
  name: string;
  network: Network;
  requests: number;
  age: number;
  url: string;
  key: string;
}
