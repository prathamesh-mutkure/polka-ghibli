import React from "react";

interface NavBarProps {
  account: string | null;
  onConnectWallet: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ account, onConnectWallet }) => {
  return (
    <nav className="bg-indigo-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Ghibli NFT Generator</h1>

        {account ? (
          <div className="text-white bg-indigo-700 px-4 py-2 rounded-full">
            {`${account.substring(0, 6)}...${account.substring(
              account.length - 4
            )}`}
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-100"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
