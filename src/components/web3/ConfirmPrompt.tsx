import { Prompt } from "@/lib/redux/slices/web3Slice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import { formatToCamelCase } from "@/lib/utils";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmPromptProps {
  open: boolean;
  needsPin?: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConfirmPromptDialog: React.FC<ConfirmPromptProps> = ({
  open,
  needsPin = false,
  onOpenChange,
}) => {
  const promptObj = useAppSelector((state) => state.web3.prompt);
  const { prompt } = promptObj;
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidPIN = /^\d{4}$/.test(pin);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-fit pt-10 animate-fade-in glass-effect flex flex-col items-center">
        <DialogHeader>
          <DialogTitle>Confirm Transaction</DialogTitle>
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

        {prompt ? (
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
          <Button className="w-1/2" variant="outline">
            Cancel
          </Button>
          <Button className="w-1/2" onClick={() => setIsLoading(!isLoading)}>
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
