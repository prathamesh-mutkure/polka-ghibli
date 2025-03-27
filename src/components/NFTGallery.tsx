import React from "react";
import { NFT } from "../types";

interface NFTGalleryProps {
  nfts: NFT[];
}

const NFTGallery: React.FC<NFTGalleryProps> = ({ nfts }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Your Ghibli NFT Collection</h2>

      {nfts.length === 0 ? (
        <p className="text-center text-gray-500 my-8">
          No NFTs found. Create your first Ghibli NFT above!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative pb-2/3">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="absolute h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium">{nft.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{nft.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">
                    Token ID: {nft.id}
                  </span>
                  <a
                    href={`https://opensea.io/assets/${process.env.REACT_APP_NETWORK_NAME}/${process.env.REACT_APP_CONTRACT_ADDRESS}/${nft.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-500"
                  >
                    View on OpenSea
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTGallery;
