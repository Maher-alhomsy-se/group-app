import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import {
  arbitrum,
  mainnet,
  base,
  unichainSepolia,
  abstractTestnet,
} from '@reown/appkit/networks';

const projectId = '2c3604abf719d2398901c2308bcb0477';

// 2. Create a metadata object - optional
const metadata = {
  name: 'group-app',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png'],
};

const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  metadata,
  projectId,
  features: { analytics: true, socials: [], email: false },
  networks: [mainnet, arbitrum, unichainSepolia, abstractTestnet, base],
});

const connectWallet = async () => {
  await appKit.open({ view: 'Connect' });
};

export default connectWallet;
