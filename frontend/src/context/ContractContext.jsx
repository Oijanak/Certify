import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import { abi } from "../utils/abi";

const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  const contractAddress = "0xaE73Bb945CC8d736Bc62E6892D40018De45Ba335";

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const prov = new ethers.providers.Web3Provider(window.ethereum);
        await prov.send("eth_requestAccounts", []);
        const sign = prov.getSigner();
        const addr = await sign.getAddress();
        const cont = new ethers.Contract(contractAddress, abi, sign);

        setProvider(prov);
        setSigner(sign);
        setContract(cont);
        setAccount(addr);

        // Listen for account changes
        window.ethereum.on("accountsChanged", ([newAccount]) => {
          setAccount(newAccount);
        });
        return cont;
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };
  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setSigner(null);
    setProvider(null);
  };

  return (
    <ContractContext.Provider
      value={{
        provider,
        signer,
        contract,
        account,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);
