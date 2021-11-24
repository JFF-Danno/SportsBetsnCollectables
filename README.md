# SportsBetsnCollectables

Sports prediction markets as a gateway to minting commemorative collectable nft cards

## The Stack

React on the front end.

Chainlink External Adapter calling the Ergast Developer API - https://ergast.com/mrd/

3 Smart Contracts
Prediction Markets contract, is also an Oracle consumer for the external adapter.
ERC721 NFT contract for the collectable cards.
VRF Consumer, using vrf to allocate collectable cards to market winners.

Java Servlet using Java AWT image libraries for adding appropriate text to the collectable cards. Stats are gathered from the Ergast Developer API.

Moralis for logging in with metamask, getting up to date pricing for Eth/Matic to USD for display of share prices and prize pool total. Also used to build the nft wallet page.

NFT Port minter page to take advantage of no fees minting and automatic listing on opensea. Not featured in the demo due to not wanting to mint licence sensitive content.


##TODO

Automation of admin functions including checking we're getting the correct round's data.



  
