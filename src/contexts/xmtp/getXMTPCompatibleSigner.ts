import { WalletClient, Hex, toHex, hexToBytes, pad } from "viem";
import { Signer } from "@xmtp/browser-sdk";
import { splitSignature } from "ethers/lib/utils";
// import { Hex, toHex } from "viem";

export const getXMTPCompatibleSigner = (
  walletClient: WalletClient
): Signer => ({
  type: "EOA",
  getIdentifier: async () => {
    return walletClient.account.address;
  },
  signMessage: async (message: String) => {
    // console.log("Raw Message =>", message);
    // const decoded = toHex(message); // Uint8Array -> 0x-prefixed hex string
    const sig = await walletClient.signMessage({
      account: walletClient.account.address,
      message,
    });
    return sig;
    // return hexToBytes(sig);
  },
});
