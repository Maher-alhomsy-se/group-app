import { useEffect, useState } from 'react';

import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { init, retrieveLaunchParams } from '@telegram-apps/sdk';

import './App.css';
import connectWallet from './util/connectWallet';
import { switchToBase } from './util/switchToBase';
import { useAppKitAccount } from '@reown/appkit/react';

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
const ADDRESS = import.meta.env.VITE_WALLET_ADDRESS;
const GROUP_ID = import.meta.env.VITE_TELEGRAM_GROUP_ID;

function App() {
  const tgData = retrieveLaunchParams();
  const { isConnected } = useAppKitAccount();

  const [userId, setUserId] = useState<number | null>(null);

  console.log(userId);
  console.log(isConnected);

  const copyHandler = () => {
    navigator.clipboard.writeText('https://t.me/upfront_app');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      init();

      setUserId(tgData.tgWebAppData?.user?.id ?? null);
    };

    fetchUserData();
  }, []);

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
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    if (network.chainId.toString() === '8453') {
      console.log('transaction');

      try {
        const tx = await signer.sendTransaction({
          to: ADDRESS,
          value: 1805000000000000,
        });

        const res = await tx.wait();
        console.log('RES : ', res);
        checkHandler(res!.hash);
      } catch (error) {
        console.log('ERROR', error);
        toast.error('something went wrong', { theme: 'dark' });
      }
    } else {
      await switchToBase();
    }
  };

  const checkHandler = async (hash: string) => {
    // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum);
    const tx = await provider.getTransaction(hash);
    console.log(tx);

    const v = ethers.formatEther(tx!.value);
    console.log(v);

    if (v === '0.001805') {
      console.log('You pay 5$');

      const url = `https://api.telegram.org/bot${BOT_TOKEN}/approveChatJoinRequest`;

      try {
        const res = await fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            chat_id: GROUP_ID,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          console.log(res);
          console.log('SUCCESS');
          toast.success('Success', { theme: 'dark' });
        }
      } catch (error) {
        toast.success('Error in approve request', { theme: 'dark' });
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center gap-6">
      {isConnected ? 'Connected' : 'Disconnected'}
      {window.ethereum ? 'ethereum' : 'No ethereum'}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xl md:font-bold">1.</span>
          <p className="md:text-xl">Ask Join to our group</p>
        </div>

        <span
          onClick={copyHandler}
          className="text-cyan-800 underline hover:text-cyan-900 cursor-pointer md:text-xl"
        >
          Copy Link
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xl md:font-bold">2.</span>
        <p className="md:text-xl">Switch to Base network</p>

        <span
          onClick={!isConnected ? connectWallet : switchToBase}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          connect
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl md:font-bold">3.</span>
          <p className="md:text-xl">Pay 5$ to accept your joining request</p>
        </div>

        <span
          onClick={payHandler}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          Pay
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xl md:font-bold">4.</span>
        <p className="md:text-xl">Done.</p>
      </div>
    </main>
  );
}

export default App;
/*
<div className="flex flex-col md:flex-row md:items-center gap-2">
        <div className="flex gap-2 items-center">
          <span className="text-xl md:font-bold">2.</span>
          <p className="text-left md:text-xl">
            Login with your telegram account
          </p>
        </div>

        <span className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer">
          <LoginButton
            lang="en"
            cornerRadius={5}
            showAvatar={true}
            buttonSize="large"
            botUsername={import.meta.env.VITE_BOT_USER_NAME}
            onAuthCallback={({ id }) => {
              setUserId(id);
            }}
          />
        </span>
      </div>
*/
