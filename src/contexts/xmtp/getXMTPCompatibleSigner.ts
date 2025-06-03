import { WalletClient, Hex, toHex, hexToBytes, pad } from "viem";
import { Signer } from "@xmtp/xmtp-js";
import { splitSignature } from "ethers/lib/utils";
// import { Hex, toHex } from "viem";

export const getXMTPCompatibleSigner = (
  walletClient: WalletClient
): Signer => ({
  getAddress: async () => walletClient.account.address as Hex,
  signMessage: async (message: Uint8Array) => {
    // console.log("Raw Message =>", message);
    const sig = await walletClient.signMessage({
      account: walletClient.account.address,
      message,
    });
    return sig;
  },
});
