import { useEffect, useState } from 'react';

import {
  useDisconnect,
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit/react';
import { toast } from 'react-toastify';
import type { EIP1193Provider } from 'viem';
import { BrowserProvider, Contract } from 'ethers';
import { init, retrieveLaunchParams } from '@telegram-apps/sdk';

import { ABI } from './constants/ABI';
import image from './assets/image.jpg';
import connectWallet from './util/connectWallet';
import { switchToBase } from './util/switchToBase';

// const ADDRESS = import.meta.env.VITE_WALLET_ADDRESS;
const CONTRACT_ADDRESS = '0xF7b801e16Bb4E10400F85E8EEd143802039AD7bA';

function App() {
  const tgData = retrieveLaunchParams();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<EIP1193Provider>('eip155');

  const [hash, setHash] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // const copyHandler = () => {
  //   openTelegramLink('https://t.me/windrunners_app');
  // };

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

      const provider = new BrowserProvider(walletProvider);
      const receipt = await provider.getTransactionReceipt(pendingTx);

      if (receipt && receipt.status === 1) {
        fetch('https://windrunnersbackend.onrender.com/verify', {
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

    const provider = new BrowserProvider(walletProvider);

    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    if (network.chainId.toString() === '8453') {
      try {
        const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

        // const priceInWei = await contract.priceInWei();

        const value = BigInt('10000000000000000'); // 0.01 ETH in wei
        const tx = await contract.pay({ value }); // send 0.01 ETH manually

        localStorage.setItem('pendingTx', tx.hash);
        setHash(tx.hash);

        toast.info('Confirm transaction', { theme: 'dark' });

        await tx.wait();
      } catch (error: any) {
        console.error(error);

        let errorMessage = error.info?.error?.message || 'Transaction failed';

        toast.error(errorMessage, { theme: 'dark' });
      }
    } else {
      toast.error('Please switch to the correct network', { theme: 'dark' });
      await switchToBase(walletProvider);
    }
  };

  const switchNetowrk = async () => {
    if (!isConnected) {
      toast.error('Connect with your wallet', { theme: 'dark' });
      connectWallet();
      return;
    }

    if (!walletProvider) {
      toast.error('Wallet provider not found', { theme: 'dark' });
      return;
    }

    await switchToBase(walletProvider);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center gap-6">
      <p>{isConnected ? 'Connected' : 'Not Connected'}</p>
      <p>
        {address && (
          <>
            {address.slice(0, 7)}...{address.slice(-7)}
          </>
        )}
      </p>

      {isConnected && (
        <button
          onClick={disconnect}
          className="ripple w-full bg-sky-700 text-black font-semibold py-3 mt-4 rounded-lg shadow-md"
        >
          Disconnect
        </button>
      )}

      <img src={image} className="rounded-md" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Join <span className="text-blue-500">Windrunners</span>
        </h2>
        <p className="text-gray-500 mt-2">
          Secure your spot in the best airdrop community!
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={switchNetowrk}
          className="ripple w-full bg-blue-500 text-white font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          🔄 Switch to Base Network
        </button>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={payHandler}
          className="ripple w-full bg-[#22202d] text-white font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-[#181622] transition"
        >
          💳 Pay $15 & Join
        </button>
      </div>

      <p className="font-semibold opacity-70 ">
        This channel is for crypto related tasks, updates, and airdrops.
        Disclaimer:{' '}
        <strong>
          Please do your own research before joining to any airdrops project.
        </strong>
      </p>
    </main>
  );
}

export default App;
