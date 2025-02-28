import { useEffect, useState } from 'react';

import {
  init,
  openTelegramLink,
  retrieveLaunchParams,
} from '@telegram-apps/sdk';
import { toast } from 'react-toastify';
import type { EIP1193Provider } from 'viem';
import { BrowserProvider, formatEther, Network } from 'ethers';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';

import './App.css';
import connectWallet from './util/connectWallet';
import { switchToBase } from './util/switchToBase';

// const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
// const ADDRESS = import.meta.env.VITE_WALLET_ADDRESS;
// const GROUP_ID = import.meta.env.VITE_TELEGRAM_GROUP_ID;

function App() {
  const tgData = retrieveLaunchParams();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');

  const [userId, setUserId] = useState<number | null>(null);
  const [ether, setEther] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);

  const copyHandler = () => {
    openTelegramLink('https://t.me/windrunners_app');
    // navigator.clipboard.writeText('https://t.me/windrunners_app');
  };

  useEffect(() => {
    init();
    setUserId(tgData.tgWebAppData?.user?.id ?? null);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!walletProvider) return;

      const provider = new BrowserProvider(walletProvider as EIP1193Provider);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address!);

      const ether = formatEther(balance);

      setEther(ether);
      setNetwork(network);
    };

    fetchData();

    if (walletProvider as EIP1193Provider) {
      (walletProvider as EIP1193Provider).on('chainChanged', fetchData);
    }

    return () => {
      if ((walletProvider as EIP1193Provider)?.removeListener) {
        (walletProvider as EIP1193Provider).removeListener(
          'chainChanged',
          fetchData
        );
      }
    };
  }, [walletProvider]);

  const payHandler = async () => {
    console.log('Click');

    // 5463878313

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
    console.log(provider);

    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    if (network.chainId.toString() === '8453') {
      console.log('transaction');

      try {
        const tx = await signer.sendTransaction({
          // to: ADDRESS,
          // to: '0xAAb109C6Ce162eFA903EFea76bD154f845b8F7b5',
          to: '0xC765462f12c2d6a9eEfeaeda93dbfA950B8b99BB',
          value: 1805000000000000,
        });

        console.log('TX : ', tx);

        fetch('https://group-app-backend.vercel.app/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tx, userId, address }),
        }).then((res) => {
          if (res.ok) {
            toast.success('Success', { theme: 'dark' });
          }
        });
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
      <div>
        <p>{isConnected ? 'Connected' : 'Not Connected'}</p>
        <p className="whitespace-break-spaces">
          {address?.slice(0, 7)}...{address?.slice(-7)}
        </p>

        <p>
          {window.localStorage
            ? 'There is a local host'
            : 'there is no a local host'}
        </p>

        <p> chain_id : {network && network.chainId}</p>
        <p>Network_name : {network && network.name}</p>
        <p>Your Ether : {ether}</p>
        <p>
          Wallet_Provider :{' '}
          {walletProvider ? 'There is a wallet provider' : 'no wallet provider'}
        </p>
      </div>

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
