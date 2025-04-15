import { useEffect, useState } from 'react';

import { disconnect, switchChain, getWalletClient } from '@wagmi/core';
import { base } from 'wagmi/chains';
import { toast } from 'react-toastify';
import { useConnect, useAccount } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { init, retrieveLaunchParams } from '@telegram-apps/sdk';

import image from './assets/image.jpg';
import { config } from './util/config';

// const ADDRESS = import.meta.env.VITE_WALLET_ADDRESS;

function App() {
  const tgData = retrieveLaunchParams();
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();

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

      if (!pendingTx) return;

      const receipt = await waitForTransactionReceipt(config, {
        hash: pendingTx as `0x${string}`,
      });

      if (receipt && receipt.status === 'success') {
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
      return;
    }

    if (!userId) {
      toast.error('Connect with your Telegram account', { theme: 'dark' });
      return;
    }

    const walletClient = await getWalletClient(config);
    const chainId = await walletClient.getChainId();

    if (chainId.toString() !== '8453') {
      toast.error('Please switch to the correct network', { theme: 'dark' });
      return;
    }

    try {
      const result = await walletClient.sendTransaction({
        account: walletClient.account,
        to: '0xC765462f12c2d6a9eEfeaeda93dbfA950B8b99BB',
        value: BigInt(5415000000000000),
      });

      localStorage.setItem('pendingTx', result);
      setHash(result);

      toast.info('Confirm transaction', { theme: 'dark' });
    } catch (error: any) {
      console.log(error);

      let errorMessage = error.info?.error?.message || 'Transaction failed';
      toast.error(errorMessage, { theme: 'dark' });
    }
  };

  const switchNetowrk = async () => {
    if (!isConnected) {
      toast.error('Connect with your wallet', { theme: 'dark' });
      return;
    }

    await switchChain(config, { chainId: base.id });
  };

  const handleDisconnect = async () => {
    await disconnect(config);
  };

  const handleConnect = (walletName: string) => {
    // const wallet = connectors.find(({ name }) => name === walletName);
    // console.log(walletName);
    // console.log(wallet);

    // if (!wallet) {
    //   toast.error('there is no wallet name');
    //   return;
    // }

    // connect({ connector: wallet });

    console.log(walletName);

    let wallet = connectors.find(({ name }) => name === walletName);

    console.log(wallet);

    if (!wallet && walletName === 'MetaMask') {
      wallet = connectors.find(({ id }) => id === 'walletConnect');
    }

    console.log(walletName);
    console.log(wallet);

    if (!wallet) {
      toast.error('Wallet not available in this environment');
      return;
    }

    connect({ connector: wallet });
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
          onClick={handleDisconnect}
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

      {!isConnected && (
        <>
          <button
            onClick={handleConnect.bind(null, 'MetaMask')}
            className="ripple w-full bg-orange-400 text-white font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-orange-700 transition"
          >
            Connect with your wallet
          </button>
        </>
      )}

      <button
        onClick={switchNetowrk}
        className="ripple w-full bg-blue-500 text-white font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        🔄 Switch to Base Network
      </button>

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
