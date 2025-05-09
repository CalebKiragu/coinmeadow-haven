import React from "react";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useWeb3Wallet } from "@/contexts/Web3ProviderContext";

interface WalletConnectorProps {
  className?: string;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({
  className = "",
}) => {
  const {
    connectWallet,
    handleConnect,
    handleWalletInstall,
    isConnecting,
    showWalletSelector,
    setShowWalletSelector,
    anyWalletInstalled,
    web3WalletsList,
  } = useWeb3Wallet();

  return (
    <>
      <Button
        onClick={handleConnect}
        className={`bg-[#0052FF] hover:bg-[#0039B3] text-white ${className}`}
        disabled={isConnecting}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>

      <Dialog open={showWalletSelector} onOpenChange={setShowWalletSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Select which wallet you want to connect with
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {anyWalletInstalled ? (
              web3WalletsList.map((wallet) => (
                <Button
                  key={wallet.type}
                  onClick={() =>
                    wallet.available
                      ? connectWallet(wallet.type)
                      : handleWalletInstall(wallet.installUrl)
                  }
                  className={`w-full flex justify-start items-center ${
                    wallet.available
                      ? `bg-${wallet.bgColor} hover:bg-opacity-90`
                      : "bg-gray-200 dark:bg-gray-700"
                  } text-white`}
                  style={{
                    backgroundColor: wallet.available
                      ? wallet.bgColor
                      : undefined,
                  }}
                  disabled={isConnecting}
                >
                  <div className="mr-2">{wallet.logo}</div>
                  <span className="flex-grow text-left">
                    {wallet.available
                      ? `Connect to ${wallet.name}`
                      : `Install ${wallet.name}`}
                  </span>
                </Button>
              ))
            ) : (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-4 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={24} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium mb-2">No Wallets Detected</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      To use DeFi features, please install one of these wallet
                      extensions:
                    </p>
                    <div className="grid gap-2">
                      {web3WalletsList.map((wallet) => (
                        <Button
                          key={wallet.type}
                          variant="outline"
                          className="w-full flex justify-between items-center"
                          onClick={() => handleWalletInstall(wallet.installUrl)}
                        >
                          <div className="flex items-center">
                            {wallet.logo}
                            <span className="ml-2">{wallet.name}</span>
                          </div>
                          <span className="text-xs">Install</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletConnector;
