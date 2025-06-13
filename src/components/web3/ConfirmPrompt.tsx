import { cancelPrompt } from "@/lib/redux/slices/web3Slice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import { formatToCamelCase, getEnvironmentConfig } from "@/lib/utils";
import { Button } from "../ui/button";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseEther } from "ethers/lib/utils";
import { useWallet } from "@/contexts/Web3ContextProvider";
import { useAccount } from "wagmi";
import SuccessStep from "./SuccessStep";
import { BigNumber } from "ethers";
import { parseUnits } from "viem";

interface ConfirmPromptProps {
  open: boolean;
  needsPin?: boolean;
  onOpenChange: (open: boolean) => void;
}

function generatePaymentLink(
  amount: number,
  currency: string,
  to: string
): string {
  const baseUrl = getEnvironmentConfig().baseUrl;
  const params = new URLSearchParams({
    amount: amount.toString(),
    currency,
    to,
  });
  return `${baseUrl}send?${params.toString()}`;
}

const ConfirmPromptDialog: React.FC<ConfirmPromptProps> = ({
  open,
  needsPin = false,
  onOpenChange,
}) => {
  const promptObj = useAppSelector((state) => state.web3.prompt);
  const wallet = useAppSelector((state) => state.web3);
  const dispatch = useAppDispatch();
  const prompt = promptObj?.prompt;
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();
  const { address, getBalance, sendTransaction, switchNetwork } = useWallet();
  const { chain } = useAccount();

  const isValidPIN = /^\d{4}$/.test(pin);

  const cancelTxn = () => {
    dispatch(cancelPrompt());
    // onOpenChange(false);
  };

  const confirmTxn = async () => {
    if (result) {
      // transaction was already processed and result captured
      dispatch(cancelPrompt());
      setResult(null);
      return;
    }

    setIsLoading(true);

    if (!wallet || !address) {
      toast({
        title: "No wallet connected",
        description:
          "Please connect MetaMask, Phantom or Coinbase Wallet to continue.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const ethOrTronRegex = /^(0x[a-fA-F0-9]{40}|T[a-zA-Z0-9]{33,34})$/; // Ethereum or Tron
    if (prompt?.type === "request") {
      // console.log("PROMPT >>> ", prompt);

      // Use below test address
      // 0xa08192608Fd7Fd43422B6ffd3f1845222280b2a6
      const link = generatePaymentLink(prompt.amount, prompt.currency, address);
      console.log(link);
      setResult({
        action: prompt.type,
        link,
        text: `Payment request processed successfully.`,
        message: `Payment Link Generated`,
        subtext: `Copy and share the link below to get paid!`,
      });
      setIsLoading(false);
    }

    if (prompt?.recipient && ethOrTronRegex.test(prompt?.recipient)) {
      // recipient is a valid blockchain address, perform txn

      try {
        // check balance
        const amountInEther = prompt?.amount.toString();
        const amountInWei = parseEther(amountInEther);
        const balanceWei = await getBalance(address);
        if (
          BigNumber.from(parseUnits(balanceWei?.total.toString(), 18)).lt(
            amountInWei
          )
        ) {
          toast({
            title: "Insufficient balance",
            description: "Top up your wallet to continue.",
            variant: "destructive",
          });
          return;
        }

        // perform transaction
        const tx = await sendTransaction(prompt?.recipient, amountInWei);
        toast({
          title: "Transaction Successful",
          description: (
            <span className="text-wrap break-all">{`TX Hash: ${tx}`}</span>
          ),
        });
        setResult({
          action: prompt.type,
          tx,
          text: `Sent ${prompt?.amount || "0.00"} ${prompt?.currency} to ${
            prompt?.recipient
          }`,
          message: `Transaction Successful`,
          subtext: `Your funds have been sent.`,
        });
      } catch (error: any) {
        console.log(error);

        toast({
          title: "Transaction Failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.link);
      toast({
        title: "Link copied!",
        description: "The payment link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy payment link to clipboard.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-fit pt-10 animate-fade-in glass-effect flex flex-col items-center">
        {!result && (
          <DialogHeader>
            <DialogTitle>
              {prompt?.type === "request"
                ? "Request Payment"
                : "Send Transaction"}
            </DialogTitle>
            <DialogDescription className="text-xl font-semibold text-gray-800 dark:text-gray-500">
              {needsPin
                ? "Enter your PIN to confirm transaction"
                : "Double-check transaction details."}
            </DialogDescription>
            {!needsPin && (
              <span className="text-sm text-gray-800 dark:text-gray-500">
                Blockchain transactions cannot be reversed!
              </span>
            )}
          </DialogHeader>
        )}

        {result ? (
          <div className="text-center space-y-2">
            <p className="text-green-600">{result?.text}</p>
            <SuccessStep
              message={result.message}
              subtext={result.subtext}
              txHash={result?.tx || null}
              explorerUrl={getEnvironmentConfig().explorerUrl(chain?.name)}
            />
            {result?.tx ? (
              <a
                href={getEnvironmentConfig().explorerUrl(
                  chain?.name,
                  result?.tx
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View on Block Explorer
              </a>
            ) : (
              <div onClick={handleCopy}>
                <span className="text-wrap break-all cursor-pointer hover:font-extrabold">
                  {result.link}
                </span>
                <Button variant="ghost" className="cursor-pointer ml-2">
                  <Copy className="h-2 w-2" />
                </Button>
              </div>
            )}
          </div>
        ) : prompt ? (
          <div>
            <p className="text-gray-800 dark:text-gray-500 mb-1">
              {formatToCamelCase(prompt?.type)}
              {": "}

              <span className="font-bold text-lg">
                {prompt?.amount?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{" "}
                {prompt?.currency?.toUpperCase()}
              </span>
            </p>

            <p className="text-gray-800 dark:text-gray-500 mb-1 w-full max-w-60 flex text-wrap break-words">
              <span>
                {prompt?.type === "request" ? "From" : "To"}
                {": "}
              </span>

              <span className="ml-1 text-blue-800 text-wrap break-all">
                {prompt?.type === "request"
                  ? prompt?.sender
                  : prompt?.recipient}
              </span>
            </p>

            {needsPin && (
              <div className="mb-2 flex flex-col items-center">
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="pin"
                >
                  Enter 4-digit PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-32 text-center px-4 py-2 border rounded-xl text-lg tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••"
                />
                {!isValidPIN && pin.length > 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    PIN must be 4 digits
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="flex flex-row w-full space-x-2">
          <Button className="w-1/2" variant="outline" onClick={cancelTxn}>
            Cancel
          </Button>
          <Button className="w-1/2" onClick={confirmTxn}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPromptDialog;
