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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cryptoCurrencies } from "@/types/currency";
import { WalletService } from "@/lib/services/walletService";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useAppSelector } from "@/lib/redux/hooks";
import WalletConnector from "./WalletConnector";
import { useWeb3Wallet } from "@/contexts/Web3ProviderContext";
import { BigNumber } from "ethers";

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
  ethAmount: z.string().min(1, { message: "ETH amount is required." }),
});

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onOpenChange,
  onCheckoutComplete,
}) => {
  const { provider } = useWeb3Wallet();
  const { toast } = useToast();
  const { wallet } = useAppSelector((state) => state.web3);
  const [isLoading, setIsLoading] = useState(false);
  const [canSend, setCanSend] = useState(false);
  const [max, setMax] = useState<BigNumber>();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState<
    "selection" | "coinbase" | "wallet" | "result"
  >("selection");
  const [walletBalance, setWalletBalance] = useState<string>("0.0");
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
    const fetchBalance = async () => {
      if (provider && wallet) {
        const balance = await provider.getBalance(wallet?.address);
        const gasPrice = await provider.getGasPrice();
        // assume 21000 gas limit for a basic ETH transfer
        const estimatedGasFee = gasPrice.mul(21000);
        const maxSendable = balance.sub(estimatedGasFee);
        setMax(maxSendable);
        balance.gte(parseEther("0.00")) ? setCanSend(true) : null;
        setWalletBalance(formatEther(balance));
      }
    };
    fetchBalance();
    if (parseEther(walletBalance).lt(parseEther(ethAmount || "0.0"))) {
      setErrorMessage("Insufficient balance");
      setShowError(true);
    }
  }, [provider, wallet, walletForm.watch("ethAmount")]);

  const handleWalletFunding = async (values: z.infer<typeof ethFormSchema>) => {
    if (!wallet) {
      toast({ title: "Wallet not connected", variant: "destructive" });
      return;
    }

    try {
      const amountInEther = values.ethAmount;
      const amountInWei = parseEther(amountInEther);

      const balanceWei = parseEther(walletBalance);
      if (balanceWei.lt(amountInWei)) {
        toast({ title: "Insufficient funds", variant: "destructive" });
        return;
      }

      setIsLoading(true);
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to: "0xb679b48a6026cadc429af8972bca77a100b05282", // replace with your ETH/Base address
        value: amountInWei,
      });

      await tx.wait();
      toast({
        title: "Transaction Successful",
        description: `TX Hash: ${tx.hash}`,
      });
      setTxHash(tx.hash);
      // setStep("result");
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
        success_url: `https://duka.pesatoken.org/dashboard?chargeId={chargeId}`,
        cancel_url: `https://duka.pesatoken.org/dashboard?chargeId={chargeId}`,
      });

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
              <WalletConnector />
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
                    <FormLabel>Amount (ETH)</FormLabel>
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
                    {showError && (
                      <FormDescription className="text-red-600">
                        {errorMessage}
                      </FormDescription>
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
                <Button type="submit" disabled={isLoading || !canSend}>
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

        {step === "result" && txHash && (
          <div className="text-center space-y-2">
            <p className="text-green-600">Transaction sent successfully!</p>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
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
