import { useEffect, useState } from 'react';

import { ethers } from 'ethers';
import { LoginButton } from '@telegram-auth/react';

import './App.css';
import connectWallet from './util/connectWallet';
import { switchToBase } from './util/switchToBase';
import { useAppKitAccount } from '@reown/appkit/react';

function App() {
  const { isConnected } = useAppKitAccount();

  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    connectWallet();
  }, []);

  const copyHandler = () => {
    navigator.clipboard.writeText('https://t.me/upfront_app');
  };

  const payHandler = async () => {
    if (!window.ethereum || !isConnected) return;

    // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const network = await provider.getNetwork();

    if (network.chainId.toString() === '1301') {
      console.log('transaction');

      try {
        const tx = await signer.sendTransaction({
          to: '0x7562D34B4Cb64ff4A100d4e54f500b3d73C321Ce',
          value: 1805000000000000,
        });

        const res = await tx.wait();
        console.log('RES : ', res);
        checkHandler(res!.hash);
      } catch (error) {
        console.log('ERROR', error);
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
        <p className="text-xl">Pay 5$ to accept your joining request</p>

        <span
          onClick={isConnected && userId ? payHandler : connectWallet}
          className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer"
        >
          Pay
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold text-2xl">4.</span>
        <p className="text-xl">Done.</p>
      </div>
    </main>
  );
}

export default App;
