import { useState } from 'react';

import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import TelegramBot from 'node-telegram-bot-api';
import { LoginButton } from '@telegram-auth/react';

import './App.css';
import connectWallet from './util/connectWallet';
import { switchToBase } from './util/switchToBase';
import { useAppKitAccount } from '@reown/appkit/react';

const bot = new TelegramBot('7992828654:AAGCEaVx1OxZA6Em79ow9P1gP0KE0SB7Mnw', {
  polling: true,
});

function App() {
  console.log('BOT TOKEN ', import.meta.env.VITE_BOT_TOKEN);

  const { isConnected } = useAppKitAccount();

  const [userId, setUserId] = useState<number | null>(null);

  console.log(isConnected);
  console.log(userId);

  const copyHandler = () => {
    navigator.clipboard.writeText('https://t.me/upfront_app');
  };

  const payHandler = async () => {
    if (!window.ethereum || !isConnected) {
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
    console.log(network);

    if (network.chainId.toString() === '8453') {
      console.log('transaction');

      console.log('ADDRESS ', import.meta.env.VITE_WALLET_ADDRESS);

      try {
        const tx = await signer.sendTransaction({
          to: '0xa8ed9b14658Bb9ea3e9CC1e32BA08fcbe6888927',
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

      console.log(import.meta.env.VITE_TELEGRAM_GROUP_ID);

      bot.approveChatJoinRequest(-1002415386979, userId!);
      toast.success('Success', { theme: 'dark' });
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center gap-3">
      <div className="flex items-center gap-2">
        <span className="font-bold text-2xl">1.</span>
        <p className="text-xl">Ask Join to our group</p>

        <span
          onClick={copyHandler}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          Copy Link
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold text-2xl">2.</span>
        <p className="text-xl">Login with your telegram account</p>

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

      <div className="flex items-center gap-2">
        <span className="font-bold text-2xl">3.</span>
        <p className="text-xl">Switch to Base network</p>

        <span
          onClick={!isConnected ? connectWallet : switchToBase}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          connect
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold text-2xl">4.</span>
        <p className="text-xl">Pay 5$ to accept your joining request</p>

        <span
          onClick={payHandler}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          Pay
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold text-2xl">5.</span>
        <p className="text-xl">Done.</p>
      </div>
    </main>
  );
}

export default App;
