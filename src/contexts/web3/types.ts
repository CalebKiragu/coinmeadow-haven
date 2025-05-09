export type WalletType = "metamask" | "phantom" | "coinbase" | "trustWallet";

export interface WalletInfo {
  type: WalletType;
  name: string;
  logo: React.ReactNode;
  available: boolean;
  installUrl: string;
  bgColor: string;
}
