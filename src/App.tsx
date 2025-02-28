import { useEffect, useState } from 'react';

import {
  init,
  openTelegramLink,
  retrieveLaunchParams,
} from '@telegram-apps/sdk';
import { toast } from 'react-toastify';
import { BrowserProvider } from 'ethers';
import type { EIP1193Provider } from 'viem';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';

import image from './assets/image.jpg';
import connectWallet from './util/connectWallet';
import { switchToBase } from './util/switchToBase';

const ADDRESS = import.meta.env.VITE_WALLET_ADDRESS;

function App() {
  const tgData = retrieveLaunchParams();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');

  const [hash, setHash] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const copyHandler = () => {
    openTelegramLink('https://t.me/windrunners_app');
  };

  useEffect(() => {
    init();
    setUserId(tgData.tgWebAppData?.user?.id ?? null);
  }, []);

  useEffect(() => {
    const checkPendingTransaction = async () => {
      const pendingTx = localStorage.getItem('pendingTx');

      if (!pendingTx) {
        return;
      }

      const provider = new BrowserProvider(walletProvider as EIP1193Provider);
      const receipt = await provider.getTransactionReceipt(pendingTx);

      if (receipt && receipt.status === 1) {
        fetch('https://group-app-backend.vercel.app/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tx: { hash: pendingTx }, userId, address }),
        }).then(async (res) => {
          const data = await res.json();

          if (res.ok) {
            localStorage.removeItem('pendingTx');
            toast.success(data.message || 'Success', { theme: 'dark' });
            setHash(null);
          } else {
            toast.error(data.message || 'Error in fetch', { theme: 'dark' });
          }
        });
      } else {
        toast.error('receipt not found', { theme: 'dark' });
      }
    };
    checkPendingTransaction();
  }, [hash]);

  const payHandler = async () => {
    if (!isConnected) {
      toast.error('Connect with your wallet', { theme: 'dark' });
      connectWallet();
      return;
    }

    if (!userId) {
      toast.error('Connect with your Telegram account', { theme: 'dark' });
      return;
    }

    // @ts-ignore
    const provider = new BrowserProvider(walletProvider);

    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    if (network.chainId.toString() === '8453') {
      try {
        const tx = await signer.sendTransaction({
          to: ADDRESS,
          value: 1805000000000000,
        });

        localStorage.setItem('pendingTx', tx.hash);
        setHash(tx.hash);

        toast.info('Confirm transaction in MetaMask', { theme: 'dark' });
      } catch (error) {
        console.log('ERROR', error);
        toast.error('something went wrong', { theme: 'dark' });
      }
    } else {
      await switchToBase();
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center gap-6">
      <p>{isConnected ? 'Connected' : 'Not Connected'}</p>

      <img src={image} className="rounded-md" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Join <span className="text-blue-500">Windrunners</span>
        </h2>
        <p className="text-gray-500 mt-2">
          Secure your spot in the best airdrop community!
        </p>
      </div>

      <div className="flex items-center flex-wrap">
        <button
          onClick={copyHandler}
          className="ripple w-full bg-blue-600 text-white font-semibold py-3 mt-3 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          📋 Copy Invitation Link
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={!isConnected ? connectWallet : switchToBase}
          className="ripple w-full bg-green-600 text-white font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-green-700 transition"
        >
          🔄 Switch to Base Network
        </button>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={payHandler}
          className="ripple w-full bg-yellow-500 text-gray-900 font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-yellow-600 transition"
        >
          💳 Pay $5 & Join
        </button>
      </div>

      <p className="text-green-500 font-semibold mt-6">
        ✅ Welcome to Windrunners!
      </p>
    </main>
  );
}

export default App;
