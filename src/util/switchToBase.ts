import { EIP1193Provider } from 'viem';
import { BrowserProvider } from 'ethers';

const BASE_PARAMS = {
  chainId: '0x2105',
  chainName: 'Base network',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org/'],
  blockExplorerUrls: ['https://basescan.org/'],
};

export const switchToBase = async (walletProvider: EIP1193Provider) => {
  const provider = new BrowserProvider(walletProvider);

  try {
    await provider.send('wallet_addEthereumChain', [BASE_PARAMS]);

    await provider.send('wallet_switchEthereumChain', [
      { chainId: BASE_PARAMS.chainId },
    ]);
  } catch (error) {
    // @ts-ignore
    if (error.code === 4902) {
      try {
        await provider.send('wallet_addEthereumChain', [BASE_PARAMS]);
        console.log('Abstract Chain added and switched!');
      } catch (addError) {
        console.error('Failed to add Abstract Chain:', addError);
      }
    } else {
      console.error('Failed to switch to Abstract Chain:', error);
    }
  }
};
