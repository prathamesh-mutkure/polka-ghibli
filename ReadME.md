# PolkaGhibli - Ghibli AI Illustratuions with ChatGPT+  

PolkaGhibli is a decentralized AI image generation platform where users can pay in **DOT or USDC** to generate **Ghibli-style AI portraits** using OpenAI's image model.  

OpenAI’s latest GPT-4o Image Generation has taken the internet by storm, with people flooding social media with stunning Studio Ghibli-style illustrations of themselves and their loved ones. My entire Twitter timeline is filled with these AI-generated portraits.

But there’s a catch—to access this feature, you need an OpenAI Pro subscription costing $20/month, which isn't feasible for everyone, especially if they just want to generate a few images.

That’s where my tool comes in. Instead of paying a monthly fee, users can pay a small, one-time fee (e.g., $0.50 in DOT/USDC) through AssetHub and get their Ghibli-style NFT minted directly to their MetaMask wallet. This makes AI-generated art affordable, decentralized, and accessible to everyone—all powered by Polkadot, Web3 payments, and NFT technology.


**Contract Address** - `0x43fA503Ef5F35c260f7ca464B71f59EB3E1a6268`


## 🚀 Features  
- **AI Art Generation** – Users upload a photo or enter a text prompt to generate a Ghibli-style image.  
- **Web3 Payments** – Pay per image in **DOT or USDC** via a Solidity smart contract on **AssetHub Westend**.  
- **Decentralized Storage** – AI-generated images are stored on **IPFS** for retrieval.  
- **NFT Minting** – Users can optionally mint their AI-generated images as NFTs.  

---

## 🔧 **Tech Stack**  
- **Frontend** – React + Vite  
- **Backend** – Node.js (Express)  
- **Smart Contract** – Solidity (Deployed on **AssetHub Westend**)  
- **AI** – OpenAI’s DALL·E for image generation  
- **Payments** – DOT/USDC  
- **Storage** – IPFS for decentralized image storage  

---

## ⚙️ **How It Works?**  

1. **User Connects Wallet**  
   - Connect a Metamask wallet and select payment in **DOT or USDC**.  

2. **Submit Image**  
   - Upload a photo.  

3. **Payment Processing**  
   - Smart contract verifies the payment and logs the order.  

4. **AI Model Generates Image**  
   - Backend processes the request using **OpenAI’s DALL·E**.  

5. **Retrieve AI Artwork**  
   - The generated image is stored on **IPFS** and accessible via a unique link.  

6. **Optional: Mint as NFT**  
   - Users can mint their image on **AssetHub** as an NFT (future feature).  

---
