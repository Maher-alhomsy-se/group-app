import { useEffect } from 'react';

import './App.css';
import connectWallet from './util/connectWallet';
import { LoginButton } from '@telegram-auth/react';

function App() {
  useEffect(() => {
    connectWallet();
  }, []);

  const copyHandler = () => {
    navigator.clipboard.writeText('https://t.me/upfront_app');
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
              console.log(id);
              // if (id) mutate({ address: address!, userId: id });
            }}
          />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold text-2xl">3.</span>
        <p className="text-xl">Pay 5$ to accept your joining request</p>

        <span className="text-cyan-800 underline text-xl hover:text-cyan-900 cursor-pointer">
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
