
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, ArrowLeftRight, InfoIcon, Star } from "lucide-react";
import { cn } from '@/lib/utils';

interface EarnButtonProps {
  className?: string;
}

// Define the staking pool types
interface StakingPool {
  id: string;
  asset: string;
  apy: number;
  lockupPeriod: string;
  minStake: number;
  description: string;
}

const stakingPools: StakingPool[] = [
  {
    id: "eth-flexible",
    asset: "ETH",
    apy: 4.5,
    lockupPeriod: "Flexible",
    minStake: 0.01,
    description: "Stake ETH with no minimum lock-up period"
  },
  {
    id: "eth-30days",
    asset: "ETH",
    apy: 6.2,
    lockupPeriod: "30 days",
    minStake: 0.05,
    description: "Higher APY with a 30-day lock-up period"
  },
  {
    id: "sol-flexible",
    asset: "SOL",
    apy: 7.5,
    lockupPeriod: "Flexible",
    minStake: 0.5,
    description: "Stake SOL with no minimum lock-up period"
  },
  {
    id: "sol-30days",
    asset: "SOL",
    apy: 9.2,
    lockupPeriod: "30 days",
    minStake: 1,
    description: "Higher APY with a 30-day lock-up period"
  }
];

const EarnButton = ({ className }: EarnButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStakeSubmit = async () => {
    if (!selectedPool) {
      toast({
        title: "Error",
        description: "Please select a staking pool first",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    if (parseFloat(amount) < selectedPool.minStake) {
      toast({
        title: "Error",
        description: `Minimum stake amount is ${selectedPool.minStake} ${selectedPool.asset}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate staking process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: `You have successfully staked ${amount} ${selectedPool.asset}`,
      });
      setOpen(false);
      setAmount('');
      setSelectedPool(null);
    }, 2000);
  };
  
  const handleWithdrawSubmit = async () => {
    if (!selectedPool) {
      toast({
        title: "Error",
        description: "Please select a staking pool first",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate withdrawal process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: `You have successfully withdrawn ${amount} ${selectedPool.asset}`,
      });
      setOpen(false);
      setAmount('');
      setSelectedPool(null);
    }, 2000);
  };
  
  const formatAPY = (apy: number) => {
    return `${apy.toFixed(2)}%`;
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        className={cn("flex items-center gap-1", className)}
      >
        <Star className="h-3 w-3" />
        <span>Stake to Earn</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Stake & Earn</DialogTitle>
            <DialogDescription>
              Grow your crypto by staking and earning interest
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="deposit" value={activeTab} onValueChange={(value) => setActiveTab(value as 'deposit' | 'withdraw')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <h3 className="text-sm font-medium">Select a staking pool</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stakingPools.map((pool) => (
                    <div 
                      key={pool.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        selectedPool?.id === pool.id 
                          ? "bg-primary/10 border-primary" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => setSelectedPool(pool)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{pool.asset}</span>
                        <span className="text-green-500 font-semibold">{formatAPY(pool.apy)} APY</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pool.lockupPeriod} • Min {pool.minStake} {pool.asset}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedPool && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="stake-amount" className="text-sm font-medium">Amount to stake</label>
                    <div className="flex gap-2">
                      <Input
                        id="stake-amount"
                        type="number"
                        placeholder={`Min ${selectedPool.minStake} ${selectedPool.asset}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setAmount(selectedPool.minStake.toString())}
                        className="whitespace-nowrap"
                      >
                        Min
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <InfoIcon className="h-4 w-4" />
                      <span>Estimated returns</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Monthly</div>
                        <div className="font-medium">
                          {amount ? (parseFloat(amount) * selectedPool.apy / 100 / 12).toFixed(6) : '0'} {selectedPool.asset}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Yearly</div>
                        <div className="font-medium">
                          {amount ? (parseFloat(amount) * selectedPool.apy / 100).toFixed(6) : '0'} {selectedPool.asset}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Button 
                className="w-full"
                disabled={!selectedPool || !amount || parseFloat(amount) <= 0 || isLoading}
                onClick={handleStakeSubmit}
              >
                {isLoading ? <Skeleton className="h-5 w-20" /> : 'Stake Now'}
              </Button>
            </TabsContent>
            
            <TabsContent value="withdraw" className="space-y-4">
              <div className="grid grid-cols-1 gap-4 mb-4">
                <h3 className="text-sm font-medium">Select a staking pool to withdraw from</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stakingPools.map((pool) => (
                    <div 
                      key={pool.id}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all",
                        selectedPool?.id === pool.id 
                          ? "bg-primary/10 border-primary" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => setSelectedPool(pool)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{pool.asset}</span>
                        <span className="text-green-500 font-semibold">{formatAPY(pool.apy)} APY</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pool.lockupPeriod} • Available: 0.00 {pool.asset}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedPool && (
                <div className="space-y-2">
                  <label htmlFor="withdraw-amount" className="text-sm font-medium">Amount to withdraw</label>
                  <div className="flex gap-2">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder={`Available: 0.00 ${selectedPool.asset}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setAmount('0')}
                      className="whitespace-nowrap"
                    >
                      Max
                    </Button>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full"
                disabled={!selectedPool || !amount || parseFloat(amount) <= 0 || isLoading}
                onClick={handleWithdrawSubmit}
              >
                {isLoading ? <Skeleton className="h-5 w-20" /> : 'Withdraw'}
              </Button>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground">Earn interest on your idle crypto assets</span>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EarnButton;
