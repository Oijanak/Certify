import React from "react";
import { useContractContext } from "../../context/ContractContext";

const ConnectButton = () => {
  const { account, connectWallet } = useContractContext();

  const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="flex items-center">
      {account ? (
        <div className="flex items-center space-x-2 bg-indigo-50 rounded-2xl white:bg-gray-800 py-2 px-4 border border-indigo-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-indigo-600 dark:text-indigo-800 font-medium text-sm">
            {shortenAddress(account)}
          </span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default ConnectButton;
