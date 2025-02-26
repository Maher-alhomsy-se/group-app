import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import { BrowserProvider, formatEther } from 'ethers';
import { init, retrieveLaunchParams } from '@telegram-apps/sdk';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';

import './App.css';
import connectWallet from './util/connectWallet';
import { switchToBase } from './util/switchToBase';

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
const ADDRESS = import.meta.env.VITE_WALLET_ADDRESS;
const GROUP_ID = import.meta.env.VITE_TELEGRAM_GROUP_ID;

function App() {
  // const tgData = retrieveLaunchParams();
  const { isConnected, address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');

  const [userId, setUserId] = useState<number | null>(null);

  console.log(userId);
  console.log(isConnected);
  console.log(walletProvider);

  const copyHandler = () => {
    navigator.clipboard.writeText('https://t.me/upfront_app');
  };

  useEffect(() => {
    // init();
    // setUserId(tgData.tgWebAppData?.user?.id ?? null);
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
    const provider = new BrowserProvider(walletProvider);
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
    const provider = new BrowserProvider(walletProvider);
    const tx = await provider.getTransaction(hash);
    console.log(tx);

    const v = formatEther(tx!.value);
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
      <div className="">
        <h2 className="text-2xl font-semibold text-gray-900">
          Join <span className="text-blue-500">Windrunners</span>
        </h2>
        <p className="text-gray-500 mt-2">
          Secure your spot in the best airdrop community!
        </p>
      </div>

      <div className="flex items-center flex-wrap">
        {/* <div className="flex items-center gap-2">
          <span className="text-xl md:font-bold">1.</span>
          <p className="md:text-xl">Ask Join to our group</p>
        </div> */}

        {/* <span
          onClick={copyHandler}
          className="text-cyan-800 underline hover:text-cyan-900 cursor-pointer md:text-xl"
        >
          Copy Link
        </span> */}

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

        {/* <span className="text-xl md:font-bold">2.</span>
        <p className="md:text-xl">Switch to Base network</p>

        <span
          onClick={!isConnected ? connectWallet : switchToBase}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          connect
        </span> */}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={payHandler}
          className="ripple w-full bg-yellow-500 text-gray-900 font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-yellow-600 transition"
        >
          💳 Pay $5 & Join
        </button>
        {/* <div className="flex items-center gap-2">
          <span className="text-xl md:font-bold">3.</span>
          <p className="md:text-xl">Pay 5$ to accept your joining request</p>
        </div>

        <span
          onClick={payHandler}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          Pay
        </span> */}
      </div>

      <p className="text-green-500 font-semibold mt-6">
        ✅ Welcome to Windrunners!
      </p>

      {/* <div className="flex items-center gap-2">
        <span className="text-xl md:font-bold">4.</span>
        <p className="md:text-xl">Done.</p>
      </div> */}
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

/*


<div class="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-center">
        <!-- Title -->
        <h2 class="text-2xl font-semibold text-gray-900">Join <span class="text-blue-500">Windrunners</span></h2>
        <p class="text-gray-500 mt-2">Secure your spot in the best airdrop community!</p>

        <!-- Step 1: Copy Link -->
        <button class="ripple w-full bg-blue-600 text-white font-semibold py-3 mt-6 rounded-lg shadow-md hover:bg-blue-700 transition">
            📋 Copy Invitation Link
        </button>

        <!-- Step 2: Connect Wallet -->
        <button class="ripple w-full bg-green-600 text-white font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-green-700 transition">
            🔄 Switch to Base Network
        </button>

        <!-- Step 3: Pay & Join -->
        <button class="ripple w-full bg-yellow-500 text-gray-900 font-semibold py-3 mt-4 rounded-lg shadow-md hover:bg-yellow-600 transition">
            💳 Pay $5 & Join
        </button>

        <!-- Step 4: Done -->
        <p class="text-green-500 font-semibold mt-6">✅ Welcome to Windrunners!</p>
    </div>


*/
