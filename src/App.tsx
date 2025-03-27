import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Components
import NavBar from "./components/NavBar";
import ImageUploader from "./components/ImageUploader";
import NFTGallery from "./components/NFTGallery";
import LoadingAnimation from "./components/LoadingAnimation";
import PaymentModal from "./components/PaymentModal";

// Types
import { NFT } from "./types";

// Constants and ABI
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants/contract";
import { API_URL } from "./constants/api";

const App: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [mintFee, setMintFee] = useState<string>("0");

  // Initialize Web3 and contract
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if MetaMask is installed
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);

          const signer = await provider.getSigner();

          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
          setContract(contract);

          // Get the mint fee - note ethers v6 returns BigInt
          const fee = await contract.mintFee();
          setMintFee(ethers.formatEther(fee));

          // Check if already connected
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0].address);
            fetchUserNFTs(accounts[0].address);
          }
        } else {
          toast.error("Please install MetaMask to use this app");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to initialize app");
      }
    };

    initialize();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to connect");
        return;
      }

      setIsLoading(true);

      // In ethers v6, you request access to accounts this way
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      setCurrentAccount(accounts[0]);
      fetchUserNFTs(accounts[0]);
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's NFTs
  const fetchUserNFTs = async (account: string) => {
    if (!contract) return;

    try {
      setIsLoading(true);

      // Get token IDs owned by the user
      const tokenIds = await contract.getTokensByOwner(account);

      // Fetch metadata for each token
      const nftPromises = tokenIds.map(async (tokenId: number) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const response = await fetch(tokenURI);
        const metadata = await response.json();

        return {
          id: tokenId.toString(),
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
      });

      const nftData = await Promise.all(nftPromises);
      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      toast.error("Failed to load your NFTs");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setShowPaymentModal(true);
  };

  // Process payment and mint NFT
  const handlePayment = async () => {
    if (!contract || !uploadedImage || !currentAccount || !provider) {
      toast.error("Missing required data for minting");
      return;
    }

    try {
      setShowPaymentModal(false);
      setIsLoading(true);

      // 1. Mint NFT and pay the fee - ethers v6 syntax for value
      const tx = await contract.mintNFT({
        value: ethers.parseEther(mintFee),
      });

      // 2. Wait for transaction confirmation
      const receipt = await tx.wait();

      // 3. Get the token ID from events - ethers v6 changed event handling
      const transferEvent = receipt?.logs.find((log) => {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          return parsedLog?.name === "Transfer";
        } catch {
          return false;
        }
      });

      const tokenId = transferEvent
        ? contract.interface
            .parseLog({
              topics: transferEvent.topics as string[],
              data: transferEvent.data,
            })
            ?.args[2].toString()
        : undefined;

      if (!tokenId) {
        throw new Error("Failed to get token ID from transaction");
      }

      // Rest of the function remains similar...
    } catch (error: any) {
      console.error("Process failed:", error);
      toast.error(`Failed to create NFT: ${error.message}`);
    } finally {
      setIsLoading(false);
      setUploadedImage(null);
    }
  };

  // Poll for job completion
  const pollJobStatus = async (jobId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await fetch(`${API_URL}/api/job-status/${jobId}`);

          if (!response.ok) {
            throw new Error("Job status check failed");
          }

          const result = await response.json();

          if (result.status === "completed") {
            resolve(result);
          } else if (result.status === "failed") {
            reject(new Error(result.error || "Job failed"));
          } else {
            // Still processing, check again in 3 seconds
            setTimeout(checkStatus, 3000);
          }
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      checkStatus();
    });
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={5000} />

      <NavBar account={currentAccount} onConnectWallet={connectWallet} />

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingAnimation message="Processing your Ghibli animation NFT... This may take a few minutes." />
        ) : (
          <>
            {!uploadedImage && (
              <ImageUploader
                onImageUpload={handleImageUpload}
                isConnected={!!currentAccount}
              />
            )}

            {showPaymentModal && (
              <PaymentModal
                price={mintFee}
                onConfirm={handlePayment}
                onCancel={() => {
                  setShowPaymentModal(false);
                  setUploadedImage(null);
                }}
              />
            )}

            {currentAccount && nfts.length > 0 && <NFTGallery nfts={nfts} />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
