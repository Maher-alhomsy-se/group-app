import { createConfig, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected, walletConnect } from '@wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    walletConnect({ projectId: '2c3604abf719d2398901c2308bcb0477' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
