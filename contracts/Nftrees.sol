// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Nftrees is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address payable private _owner;
    uint256 private _cap = 0;

    event CapChanged(uint256 newCap);

    constructor(string memory myBase) ERC721("NFT", "Item") {
        _setBaseURI(myBase);
        _owner = msg.sender;
    }

    function buyItem()
        public
        payable
        returns (uint256)
    {
        require(msg.value == 0.2 ether, "Need to send exactly 0.2 ether");
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _owner.transfer(msg.value);
        return newItemId;
    }   

    function getCurrentTokenId() public view returns (uint256){
        return _tokenIds.current();
    }

    function getOwner() public view returns (address) {
        return _owner;
    }

    function getCap() public view returns (uint256){
        return _cap;
    }

    function setCap(uint256 newCap) public returns (uint256){
        require(_owner==msg.sender);
        require(newCap<=420);
        _cap = newCap;
        emit CapChanged(newCap);
        return _cap;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        if (from == address(0)) { 
            require(totalSupply() < _cap, "ERC721 Capped: cap exceeded");
        }
    }
}