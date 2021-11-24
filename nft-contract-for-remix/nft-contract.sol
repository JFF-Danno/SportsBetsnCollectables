pragma solidity 0.6.6;

//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC721/ERC721.sol";

contract SimpleCollectible is ERC721 {
  uint256 public tokenCounter;
  mapping (address => bool) public whiteList;
  address private PredictionContractAddress;
  address private adminAddress;
  
  modifier onlyPredictionContract() {
        require(PredictionContractAddress == msg.sender, '!Prediction Market Contract');
        _;
  }
    
  modifier onlyAdmin() {
        require(adminAddress == msg.sender, '!admin');
        _;
  }  
    
  constructor () public ERC721 ("F1Collectable","F1C"){
    adminAddress = msg.sender;
    tokenCounter = 0;
  }
  
  function createCollectible(string memory tokenURI) public returns (uint256) {
    require(whiteListContains(msg.sender), 'Minter is not whitelisted!');
    uint256 newItemId = tokenCounter;
    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
    tokenCounter = tokenCounter + 1;
    return newItemId;
  }
  
  function addToWhiteList(address minter) public onlyPredictionContract() {
    whiteList[minter] = true;
  }
  
  function whiteListContains(address _wallet) public view returns (bool){
     return whiteList[_wallet];
  }
  
  function setPredictionContractAddress(address contractAddress) public onlyAdmin() {
      PredictionContractAddress = contractAddress;
  }
  
}
