import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cryptoCurrencies } from "@/types/currency";
import { WalletService } from "@/lib/services/walletService";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useAppSelector } from "@/lib/redux/hooks";
import Web3Connector from "./Web3Connector";
import { useWallet } from "@/contexts/Web3ContextProvider";
import { ApiService } from "@/lib/services";
import { getEnvironmentConfig } from "@/lib/utils";
import ChainSwitcher from "./ChainSwitcher";
import { BigNumber } from "ethers";
import SuccessStep from "./SuccessStep";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckoutComplete?: () => void;
}

// Define the form schema with validation
const formSchema = z.object({
  amount: z.string().min(1, {
    message: "Amount is required.",
  }),
  currency: z.string().min(1, {
    message: "Currency is required.",
  }),
});

// Define ETH form schema
const ethFormSchema = z.object({
  ethAmount: z.string().min(1, { message: "Amount is required." }),
});

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onOpenChange,
  onCheckoutComplete,
}) => {
  const {
    getBalance,
    getGasPrice,
    sendTransaction,
    switchNetwork,
    depositAddress,
  } = useWallet();
  const { toast } = useToast();
  const { wallet } = useAppSelector((state) => state.web3);
  const user = useAppSelector((state: any) => state.auth.user);
  const merchant = useAppSelector((state: any) => state.auth.merchant);
  const [isLoading, setIsLoading] = useState(false);
  const [max, setMax] = useState<string>("0.0");
  const [amountToSend, setAmountToSend] = useState<string>("0.0");
  const [walletBalance, setWalletBalance] = useState<string>("0.0");
  const [showBalanceError, setShowBalanceError] = useState(false);
  const [balanceErrorMessage, setBalanceErrorMessage] = useState("");
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [networkErrorMessage, setNetworkErrorMessage] = useState("");
  const [step, setStep] = useState<
    "selection" | "coinbase" | "wallet" | "result"
  >("selection");
  const [txHash, setTxHash] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      currency: "ETH",
    },
  });

  const walletForm = useForm<z.infer<typeof ethFormSchema>>({
    resolver: zodResolver(ethFormSchema),
    defaultValues: { ethAmount: "" },
  });

  useEffect(() => {
    const ethAmount = walletForm.watch("ethAmount").toString();
    setAmountToSend(ethAmount);
    let balance, gasPrice, maxSendable;
    const fetchWalletBalance = async () => {
      if (wallet) {
        balance = formatEther(await getBalance());
        setWalletBalance(balance);
        gasPrice = await getGasPrice();
        // maxSendable = formatEther(parseEther(balance).sub(gasPrice));
        maxSendable = parseEther(balance).gte(gasPrice)
          ? parseEther(balance).sub(gasPrice)
          : 0n;

        if (BigNumber.from(maxSendable).gt(parseEther(ethAmount || "0.0"))) {
          setMax(formatEther(maxSendable));
          setBalanceErrorMessage("");
          setShowBalanceError(false);
        } else {
          setMax("0.0");
          setBalanceErrorMessage("Insufficient balance");
          setShowBalanceError(true);
        }

        if (
          wallet?.chain?.includes("Sepolia") &&
          getEnvironmentConfig().currentEnv === "production"
        ) {
          setNetworkErrorMessage(
            `Cannot fund from ${wallet?.chain} testnet to mainnet`
          );
          setShowNetworkError(true);
        } else if (
          !wallet?.chain?.includes("Sepolia") &&
          getEnvironmentConfig().currentEnv === "development"
        ) {
          setNetworkErrorMessage(
            `Cannot fund from ${wallet?.chain} mainnet to testnet`
          );
          setShowNetworkError(true);
        } else if (
          !wallet?.chain?.includes("Sepolia") &&
          getEnvironmentConfig().currentEnv !== "production"
        ) {
          setNetworkErrorMessage(
            `Cannot fund from ${wallet?.chain} mainnet to testnet`
          );
          setShowNetworkError(true);
        } else {
          setNetworkErrorMessage("");
          setShowNetworkError(false);
        }
      }
    };
    fetchWalletBalance();
  }, [wallet, walletForm.watch("ethAmount")]);

  const handleWalletFunding = async (values: z.infer<typeof ethFormSchema>) => {
    if (!wallet) {
      toast({ title: "No wallet connected", variant: "destructive" });
      return;
    }

    if (showBalanceError)
      return toast({ title: `${balanceErrorMessage}`, variant: "destructive" });
    if (showNetworkError)
      return toast({ title: `${networkErrorMessage}`, variant: "destructive" });

    try {
      const amountInEther = values.ethAmount;
      const amountInWei = parseEther(amountInEther);
      const balanceWei = parseEther(walletBalance);
      if (balanceWei.lt(amountInWei)) {
        toast({ title: "Insufficient funds", variant: "destructive" });
        return;
      }
      setIsLoading(true);
      const tx = await sendTransaction(depositAddress, amountInWei);
      toast({
        title: "Transaction Successful",
        description: `TX Hash: ${tx}`,
      });
      setTxHash(tx);
      setStep("result");
      onOpenChange(false);
      onCheckoutComplete?.();
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoinbaseCheckout = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const charge = await WalletService.createCharge({
        amount: values.amount,
        currency: values.currency,
        orderId: `order-${Date.now()}`,
        type: "customer",
      });
      // let success_url = `https://duka.pesatoken.org/dashboard?chargeId=${charge.id}`,
      //   cancel_url = `https://duka.pesatoken.org/dashboard?chargeId=${chargeId}`;

      if (charge && charge.id) {
        if (charge.hosted_url) {
          // Open the hosted checkout URL in a new tab
          window.open(charge.hosted_url, "_blank");
        }

        toast({
          title: "Checkout initiated",
          description: "Please complete the payment process.",
        });
        onOpenChange(false);
        if (onCheckoutComplete) {
          setStep("result");
          onCheckoutComplete();
        }
      } else {
        toast({
          title: "Checkout Failed",
          description: "Unable to initiate checkout process.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fund Wallet</DialogTitle>
          <DialogDescription>Select a method to add funds</DialogDescription>
        </DialogHeader>

        {step === "selection" && (
          <div className="flex flex-col gap-4">
            {wallet ? (
              <Button variant="outline" onClick={() => setStep("wallet")}>
                Fund with Linked Wallet
              </Button>
            ) : (
              <Web3Connector />
            )}
            <Button onClick={() => setStep("coinbase")}>
              Fund with Coinbase
            </Button>
          </div>
        )}

        {step === "wallet" && (
          <Form {...walletForm}>
            <form
              onSubmit={walletForm.handleSubmit(handleWalletFunding)}
              className="space-y-6"
            >
              <FormField
                control={walletForm.control}
                name="ethAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({wallet?.chain})</FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.000001"
                          className="mr-2"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (
                              BigNumber.from(parseEther(max)) >
                              BigNumber.from(0n)
                            )
                              walletForm.setValue(
                                "ethAmount",
                                max?.toString() || "0.0"
                              );
                          }}
                        >
                          Max
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>Enter ETH amount to send</FormDescription>
                    {(showBalanceError || showNetworkError) && (
                      <div className="flex flex-col">
                        {balanceErrorMessage && (
                          <FormDescription className="text-red-600">
                            {balanceErrorMessage}
                          </FormDescription>
                        )}
                        <div className="flex items-center">
                          {networkErrorMessage && (
                            <FormDescription className="text-red-600">
                              {networkErrorMessage}
                            </FormDescription>
                          )}
                          {showNetworkError && (
                            <ChainSwitcher switchNetwork={switchNetwork} />
                          )}
                        </div>
                      </div>
                    )}

                    {depositAddress && (
                      <div className="flex flex-col">
                        <h6 className="text-sm">Address:</h6>
                        <FormDescription>{depositAddress}</FormDescription>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  onClick={() => setStep("selection")}
                  disabled={isLoading}
                  variant="outline"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || showBalanceError || showNetworkError}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send ETH"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === "coinbase" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCoinbaseCheckout)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.000001"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the amount to deposit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cryptoCurrencies.map((crypto) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol}>
                            {crypto.name} ({crypto.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the currency to deposit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  onClick={() => setStep("selection")}
                  disabled={isLoading}
                  variant="outline"
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Coinbase Checkout"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === "result" && (
          <div className="text-center space-y-2">
            <p className="text-green-600">{`Sent ${
              amountToSend || "0.00"
            } ${wallet?.chain?.toUpperCase()} to ${depositAddress}`}</p>
            <SuccessStep
              message={"Transaction Successful"}
              subtext={"Your funds have been sent."}
              txHash={txHash}
              explorerUrl={
                wallet?.chain.includes("Base")
                  ? `https://basescan.org/tx/`
                  : `https://etherscan.io/tx/`
              }
            />
            <a
              href={
                wallet?.chain.includes("Base")
                  ? `https://basescan.org/tx/${txHash}`
                  : `https://etherscan.io/tx/${txHash}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Block Explorer
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
