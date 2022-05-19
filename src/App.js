import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = "0x9495E7DAB818bE1E1B9cD3eCaf8e7D406B580bD2";
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const { ethereum } = window;
  
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
  
        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
  
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

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
        console.log("Found an authorized account:", account, getAllWaves());
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Implement the connectWallet method

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // calling wave function
  const wave = async ()=> {
    
    const userMessage = document.getElementById('userMessage').value;
    
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

        //Execute wave from smart contract and set gas limit
        const waveTransaction = await wavePortalContract.wave(userMessage, {gasLimit: 300000});
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
  }, []);

  useEffect(() => {
    getAllWaves();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <h1>👋 Hello!</h1>
        </div>

        <div className="bio">
          <h2>Connect your Ethereum wallet and wave at me!</h2>
          <h3>You will need a MetaMask wallet and Rinkeby Test Network funds in order to wave</h3>
        </div>

<input type="text" id="userMessage" className="user-message" placeholder="Type your message here"/>
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

{allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "white", marginTop: "16px", padding: "8px", borderRadius:"5px", fontFamily: "Print Clearly", font: "#8992B1"}}>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
      }
  
export default App;
