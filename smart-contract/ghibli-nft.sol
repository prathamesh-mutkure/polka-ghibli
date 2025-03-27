// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GhibliNFT
 * @dev A simple NFT contract for Ghibli-style animations
 */
contract GhibliNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    // Cost to generate a Ghibli NFT (1 USD in native token)
    uint256 public mintFee;

    // Mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    // Mapping from owner to their tokens
    mapping(address => uint256[]) private _ownedTokens;

    // Events
    event NFTMinted(address owner, uint256 tokenId, string tokenURI);
    event MintFeeUpdated(uint256 newFee);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialMintFee
    )
        ERC721(name, symbol)
        Ownable(msg.sender) // Pass the deployer as the initial owner
    {
        mintFee = initialMintFee;
    }

    // Allow users to mint NFT by paying the fee
    function mintNFT() public payable returns (uint256) {
        require(msg.value >= mintFee, "Insufficient payment");

        // Mint the NFT without URI (will be set later by the backend)
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);

        // Add token to owner's list
        _ownedTokens[msg.sender].push(tokenId);

        return tokenId;
    }

    // Only owner can set the token URI after minting
    // This will be called by the backend after processing the image
    function setTokenURI(uint256 tokenId, string memory uri) public onlyOwner {
        require(_exists(tokenId), "URI set for nonexistent token");
        _tokenURIs[tokenId] = uri;
        emit NFTMinted(ownerOf(tokenId), tokenId, uri);
    }

    // Owner can mint directly and set URI (for testing or admin purposes)
    function adminMint(
        address to,
        string memory uri
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _tokenURIs[tokenId] = uri;

        // Add token to owner's list
        _ownedTokens[to].push(tokenId);

        emit NFTMinted(to, tokenId, uri);
        return tokenId;
    }

    // Update mint fee
    function setMintFee(uint256 newFee) public onlyOwner {
        mintFee = newFee;
        emit MintFeeUpdated(newFee);
    }

    // Withdraw funds from the contract
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Get token URI implementation
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];

        // If token URI is set, return it
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }

        // If no URI is set, return a default
        return
            string(
                abi.encodePacked(
                    "https://example.com/api/token/",
                    tokenId.toString()
                )
            );
    }

    // Check if token exists (for internal use)
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Get token IDs owned by an address (convenience function)
    function getTokensByOwner(
        address owner
    ) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    // Override for transferring to keep track of owned tokens
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        address previousOwner = super._update(to, tokenId, auth);

        // If this is a transfer (not a mint or burn), update the owned tokens
        if (from != address(0) && to != address(0)) {
            // Remove from previous owner
            _removeTokenFromOwnerEnumeration(from, tokenId);
            // Add to new owner
            _ownedTokens[to].push(tokenId);
        } else if (to == address(0)) {
            // This is a burn
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }

        return previousOwner;
    }

    // Helper to remove token from owner's enumeration
    function _removeTokenFromOwnerEnumeration(
        address owner,
        uint256 tokenId
    ) private {
        uint256[] storage ownerTokens = _ownedTokens[owner];
        uint256 lastTokenIndex = ownerTokens.length - 1;

        // Find the index of the token to remove
        uint256 tokenIndex;
        for (uint256 i = 0; i < ownerTokens.length; i++) {
            if (ownerTokens[i] == tokenId) {
                tokenIndex = i;
                break;
            }
        }

        // If token is not the last one, move the last token to the index of the token to remove
        if (tokenIndex != lastTokenIndex) {
            ownerTokens[tokenIndex] = ownerTokens[lastTokenIndex];
        }

        // Remove the last token (which is now a duplicate if we moved, or the one to remove)
        ownerTokens.pop();
    }

    // Get balance of owner
    function balanceOf(
        address owner
    ) public view virtual override returns (uint256) {
        require(owner != address(0), "Balance query for the zero address");
        return _ownedTokens[owner].length;
    }
}
