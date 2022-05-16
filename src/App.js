import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const contractAddress = "0xa6696027419fBB2771897Cc9D7ba74DF614651d2";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  //Implement the connectWallet method
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  //calling wave function
  const wave = async ()=> {
    try {
      const {ethereum} = window;

      if (ethereum){
        //ethers is a  library that helps the frontend talk to the contract
        //provdider is what we use to talk to Ethereum nodes
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count.", count.toNumber());

        //Execute wave from smart contract
        const waveTransaction = await wavePortalContract.wave();
        console.log("mining.", waveTransaction.hash);
        
        await waveTransaction.wait();
        console.log("Mined --", waveTransaction.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count.", count.toNumber());

      } else {
        console.log("Ethereum object does not exist.");
      } 
    }catch (error){
        console.log(error);
      }
    }
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <h1>
          👋 Hello!
        </h1>
        </div>

        <div className="bio">
          <h2>
          Connect your Ethereum wallet and wave at me!
          </h2>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        
      </div>
    </div>
  );
}

export default App