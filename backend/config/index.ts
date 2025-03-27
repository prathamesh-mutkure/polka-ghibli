import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default {
  port: process.env.PORT || 3001,
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  providerUrl: process.env.PROVIDER_URL || "",
  privateKey: process.env.PRIVATE_KEY || "",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3001",
  animationApiKey: process.env.ANIMATION_API_KEY || "",
  ipfsApiKey: process.env.IPFS_API_KEY || "",
  ipfsApiSecret: process.env.IPFS_API_SECRET || "",
};
