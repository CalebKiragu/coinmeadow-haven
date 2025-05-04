
import { ethers } from 'ethers';

// Simplified ABI for the Base Earn Vault
const VAULT_ABI = [
  "function deposit(uint256 _amount) external",
  "function withdraw(uint256 shares) external",
  "function balanceOf(address account) view returns (uint256)",
  "function getPricePerFullShare() view returns (uint256)",
  "function token() view returns (address)"
];

export const VAULT_ADDRESS = "0x859291D42bC0f9d3988209E3a4920a0E30D58016";

// Function to get the vault contract instance
const getVaultContract = async (
  providerOrSigner: ethers.providers.Web3Provider | ethers.Signer
) => {
  return new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, providerOrSigner);
};

// Function to get the token contract for the vault
const getTokenContract = async (
  providerOrSigner: ethers.providers.Web3Provider | ethers.Signer
) => {
  const vault = await getVaultContract(providerOrSigner);
  const tokenAddress = await vault.token();
  
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function name() view returns (string)",
    "function approve(address spender, uint256 amount) returns (bool)"
  ];
  
  return new ethers.Contract(tokenAddress, ERC20_ABI, providerOrSigner);
};

export interface StakingInfo {
  apy: string;
  vaultBalance: string;
  tokenBalance: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  pricePerShare: string;
}

export const StakingService = {
  getStakingInfo: async (
    provider: ethers.providers.Web3Provider,
    userAddress: string
  ): Promise<StakingInfo> => {
    try {
      const vault = await getVaultContract(provider);
      const token = await getTokenContract(provider);
      
      const vaultBalanceWei = await vault.balanceOf(userAddress);
      const tokenBalanceWei = await token.balanceOf(userAddress);
      const pricePerShareWei = await vault.getPricePerFullShare();
      const tokenSymbol = await token.symbol();
      const tokenName = await token.name();
      const tokenDecimals = await token.decimals();
      
      // Calculate an estimated APY based on historical data
      // In a real implementation, this would likely come from an API
      const apy = "4.5%"; // Mock value
      
      // Convert from wei to token amount using decimals
      const divisor = ethers.BigNumber.from(10).pow(tokenDecimals);
      const vaultBalance = ethers.utils.formatUnits(vaultBalanceWei, tokenDecimals);
      const tokenBalance = ethers.utils.formatUnits(tokenBalanceWei, tokenDecimals);
      const pricePerShare = ethers.utils.formatUnits(pricePerShareWei, tokenDecimals);
      
      return {
        apy,
        vaultBalance,
        tokenBalance,
        tokenSymbol,
        tokenName,
        tokenDecimals,
        pricePerShare,
      };
    } catch (error) {
      console.error("Error getting staking info:", error);
      throw error;
    }
  },
  
  stakeTokens: async (
    signer: ethers.Signer,
    amount: string,
    decimals: number
  ): Promise<ethers.providers.TransactionResponse> => {
    try {
      const vault = await getVaultContract(signer);
      const token = await getTokenContract(signer);
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseUnits(amount, decimals);
      
      // First approve the vault to spend tokens
      const approveTx = await token.approve(VAULT_ADDRESS, amountWei);
      await approveTx.wait();
      
      // Then deposit tokens into the vault
      return await vault.deposit(amountWei);
    } catch (error) {
      console.error("Error staking tokens:", error);
      throw error;
    }
  },
  
  unstakeTokens: async (
    signer: ethers.Signer,
    amount: string,
    decimals: number
  ): Promise<ethers.providers.TransactionResponse> => {
    try {
      const vault = await getVaultContract(signer);
      
      // Convert amount to wei
      const amountWei = ethers.utils.parseUnits(amount, decimals);
      
      // Withdraw tokens from the vault
      return await vault.withdraw(amountWei);
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      throw error;
    }
  },
  
  // Get mock staking assets for demo if wallet not connected
  getMockStakingAssets: () => {
    return [
      { 
        symbol: "ETH", 
        name: "Ethereum", 
        balance: "1.23", 
        apy: "4.5%",
        decimals: 18
      },
      { 
        symbol: "USDC", 
        name: "USD Coin", 
        balance: "458.67", 
        apy: "3.8%",
        decimals: 6 
      },
      { 
        symbol: "DAI", 
        name: "Dai Stablecoin", 
        balance: "325.45", 
        apy: "4.2%",
        decimals: 18
      }
    ];
  }
};
