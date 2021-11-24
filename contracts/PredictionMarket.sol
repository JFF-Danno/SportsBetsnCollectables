// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract PredictionMarket is ChainlinkClient {
    using Chainlink for Chainlink.Request;
  
    uint256  public drivernumber = 0;
    bool     public isComplete = false;
    address  public NFTContractAddress;
    address  public VRFContractAddress = 0xB082580355b203ACD731D82CD02A5404661E1907;
    
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    address private adminAddress;
    uint256 public  totalPrizePool;
    bool public marketsOpen = true;
    uint256 totalSharesBought = 0;    
    mapping(uint256 => MarketData) public marketData;
    mapping(address => bool) public claimedMap;
    address[] private accounts;
    mapping(address => uint256) public vrfRandoms;  
    
    modifier onlyAdmin() {
        require(adminAddress == msg.sender, '!admin');
        _;
    }
   
   event SharesBought(
    uint256 indexed marketId,
    uint256 shares,
    address buyer
   );
   
   event PrizeClaimed(
    uint256 indexed marketId,
    uint256 amount,
    address buyer
   );
    
    /**
     * Network: Kovan
     * Oracle: 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8 (Chainlink Devrel   
     * Node)
     * Job ID: d5270d1c311941d0b08bead21fea7747
     * Fee: 0.1 LINK
     */
    constructor() {
        setPublicChainlinkToken();
        oracle = 0x765aCc258f3a7b2D8d103D1A9310fc51b07D5425;
        jobId = "2146a7c3927545e7a7fe2b40023670a8";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
        adminAddress = msg.sender;
    }
    
    /**
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestPosition() public onlyAdmin() returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        request.add("path", "data,MRData,RaceTable,Races,0,Results,0,number");
        
        // Multiply the result by 1000000000000000000 to remove decimals
        int timesAmount = 10**18;
        request.addInt("times", timesAmount);
        
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfill(bytes32 _requestId, uint256 _drivernumber) public recordChainlinkFulfillment(_requestId)
    {
        marketsOpen = false;
        drivernumber = _drivernumber;
        isComplete = true;
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
    
    /*
    *The prediction market part.
    *
    */

    struct MarketData {
        string  name;
        uint256 driverNumber;
        uint256 sharesSold;
        bool    payout;
        bool    created;
    }
    
    mapping(address => mapping( uint256 => uint256 ) ) public marketSharesOwned;
    
    function createMarket(string memory _name, uint256 _driverNumber ) external onlyAdmin() {
      marketData[_driverNumber] = MarketData(
            _name,
            _driverNumber,
            0,
            false,
            true
      );
    }
    
    function createMarket(string memory _name, uint256[] memory _driverNumbers ) external onlyAdmin() {
      for ( uint256 i = 0; i < _driverNumbers.length; i++ ) {
        marketData[_driverNumbers[i]] = MarketData(
              _name,
              _driverNumbers[i],
              0,
              false,
              true
        );
      }
    }
    
    function marketExists(uint256 _marketId) public view returns (bool) {
      return marketData[_marketId].created;
    }
    
    function getSharesSold (uint256 _marketId) external view returns(uint256) {
      return marketData[_marketId].sharesSold; 
    }
    
    function getMarketName (uint256 _marketId) external view returns(string memory) {
      return marketData[_marketId].name; 
    }
    
    function getDriverNumber (uint256 _marketId) external view returns(uint256) {
      return marketData[_marketId].driverNumber; 
    }
    
    function willPayout (uint256 _marketId) external view returns(bool) {
      return marketData[_marketId].payout; 
    }
    
    function getSharesOwned(uint256 _idMarket) external view returns (uint256) {
      return marketSharesOwned[msg.sender][_idMarket];
    }
    
    function claim(address payable receiver, uint256 _marketId) external returns(bool success ,bytes memory returnData)  {
      require( marketExists(_marketId), 'Market does not exist' );
      require( marketData[_marketId].payout, 'Market is not paying out' );
      require( marketSharesOwned[receiver][_marketId] > 0, 'No shares owned' );
      uint256 payout = ( 100 * marketSharesOwned[receiver][_marketId] * totalPrizePool /  marketData[_marketId].sharesSold )  / 100;
      claimedMap[receiver] = true;
      marketSharesOwned[receiver][_marketId] = 0;
      receiver.transfer( payout );
      emit PrizeClaimed(_marketId,payout,msg.sender);
      (success,returnData) =  address(NFTContractAddress).call{gas: 1000000}(abi.encodeWithSignature("addToWhiteList(address)", msg.sender )); //not really sure this should be the return from this function
    }
    
    function claimAmount(address payable receiver, uint256 _marketId) external view returns(uint256)  {
      uint256 payout = (  100 * marketSharesOwned[receiver][_marketId] * totalPrizePool /  marketData[_marketId].sharesSold )  / 100;
      return payout;
    }
    
    function canClaim() external view returns (bool) {
      return marketSharesOwned[msg.sender][drivernumber] > 0 && marketData[drivernumber].payout;       
    }
    
    function claimed(address claimer) external view returns (bool) {
      return claimedMap[claimer];
    }
    
    uint baseRate        = 200000000000000; // close to a dollar
    uint rateAdjustment  = 200000000000000;
    
    function getSharePrice(uint256 _idMarket) public view returns (uint256) {
      if ( totalSharesBought == 0 ) {
        return baseRate;
      }
      uint plus =  ( marketData[_idMarket].sharesSold * (10**2) ) / totalSharesBought;
      uint256 price = baseRate + ( ( plus * rateAdjustment ) / 100 );
      return price;
    }
    
    function buyShares(uint256 _idMarket, uint256 _numberOfTokens) payable external {
      require( marketsOpen, 'Markets are closed!' );
      require( msg.value == ( getSharePrice(_idMarket) * _numberOfTokens ), 'Insufficent value' );
      require( marketExists(_idMarket), 'Market does not exist' );  
      marketData[_idMarket].sharesSold += _numberOfTokens;
      marketSharesOwned[msg.sender][_idMarket] += _numberOfTokens;
      totalSharesBought += _numberOfTokens;
      addAccount(msg.sender);
      emit PrizeClaimed(_idMarket,_numberOfTokens,msg.sender);
    }
    
    function addAccount(address buyer) private {
      bool found = false;
      for (uint i=0; i < accounts.length; i++) {
        if (buyer == accounts[i]) {
          found = true;
        }
      }
      if ( ! found ) {
        accounts.push(buyer);
      }
    }
        
    /*
        Admin and dev functions
    */    
    
    function claimAll(address payable reciever) public onlyAdmin() {
      reciever.transfer( address(this).balance );
    }
    
    function devSetDriverNumber(uint256 _driver) public onlyAdmin() {
      drivernumber = _driver;
      marketData[drivernumber].payout = true;
    }
    
    function processResults () external onlyAdmin() {
      require( drivernumber > 0, 'Market not ready to process!' );
      marketData[drivernumber].payout = true;
      (,bytes memory randomBytes) =  address(VRFContractAddress).call{gas: 1000000}(abi.encodeWithSignature("getRandomNumber()", msg.sender ));   
      expand(abi.decode(randomBytes, (uint256)));
    }
    
    function expand(uint256 randomValue) private {
      for (uint256 i = 0; i < accounts.length; i++) {
         vrfRandoms[accounts[i]] = uint256(keccak256(abi.encode(randomValue, i))) % 10;
      }
    }
    
    function closeMarkets() public onlyAdmin() returns (bool) {
      marketsOpen = false;
      totalPrizePool = address(this).balance;
      return marketsOpen;
    }
    
    function openMarkets() public onlyAdmin() returns (bool) {
      marketsOpen = true;
      return marketsOpen;
    }

    function setNFTContractAddress(address contractAddress) external onlyAdmin() {
      NFTContractAddress = contractAddress;
    }
    
    function testWhiteList(address contractAddress) external onlyAdmin() returns (bool success ,bytes memory returnData) {
     (success,returnData) =  address(contractAddress).call{gas: 1000000}(abi.encodeWithSignature("addToWhiteList(address)", msg.sender ));
    }
    

}

