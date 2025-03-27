export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
}

// File: src/constants/contract.ts
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "";

export const CONTRACT_ABI = [
  // Only including essential ABI functions for brevity
  "function mintNFT() public payable returns (uint256)",
  "function setTokenURI(uint256 tokenId, string memory uri) public",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function getTokensByOwner(address owner) public view returns (uint256[] memory)",
  "function mintFee() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];
