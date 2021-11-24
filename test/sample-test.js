const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  it("Should setup a market, buy shares and return the shares bought", async function () {
  
  
    const accounts = await hre.ethers.getSigners();
    const account0     = accounts[0].address;
    const account1     = accounts[1].address;
    const account2     = accounts[2].address;
    const account3     = accounts[3].address;
    
    const pm = await ethers.getContractFactory("PredictionMarket");
    const pmd = await pm.deploy();
    await pmd.deployed();
    
    await pmd.createMarket("USGP Podium for Verstappen",20,33,100);
    
    await pmd.createMarket("USGP Podium for Hamilton",20,44,100);
   
    const created = await pmd.marketExists(33);
    console.log( 'market created ?  ' + created );
    
    console.log( '######################### ');
   
    const valueSend2 =  2000000;
  //  console.log( 'value to send 33 - ' + valueSend2);
    await pmd.buyShares2( 33, 10 , { from: account0, value:  valueSend2 } );
    const shares2 = await pmd.getSharesOwned( 33 );
    console.log( 'shares owned 33 - ' + shares2 );
    const totalShares = await pmd.getSharesSold( 33 );
    console.log( 'total shares sold ' + totalShares );
     let price = await pmd.getSharePrice( 33 );
    console.log( 'share price 33 - ' + price);
    price = await pmd.getSharePrice( 44 );
    console.log( 'share price 44 - ' + price);
    
    console.log( '######################### ');    
  
    const valueSend4 = 200000;
//    console.log( 'value to send 44 - ' + valueSend4);
    await pmd.buyShares2( 44, 10 , { from: account0, value:  valueSend4 } );
    const shares4 = await pmd.getSharesOwned( 44 );
    console.log( 'shares owned 44 - ' + shares4 );
    const totalShares4 = await pmd.getSharesSold( 44 );
    console.log( 'total shares sold - ' + totalShares4 );
    price = await pmd.getSharePrice( 33 );
    console.log( 'share price 33 - ' + price);
      let price4 = await pmd.getSharePrice( 44 );
    console.log( 'share price 44 - ' + price4);

    
    console.log( '######################### ');     
     
   
    const valueSend3 = 200000;
//    console.log( 'value to send 33 - ' + valueSend3);
    await pmd.buyShares2( 33, 10 , { from: account0, value:  valueSend3 } );
    const shares3 = await pmd.getSharesOwned( 33 );
    console.log( 'shares owned 33 - ' + shares3 );
    const totalShares2 = await pmd.getSharesSold( 33 );
    console.log( 'total shares sold - ' + totalShares2 );
     const price2 = await pmd.getSharePrice( 33 );
    console.log( 'share price 33 - ' + price2);

     price4 = await pmd.getSharePrice( 44 );
    console.log( 'share price 44 - ' + price4);
    
    console.log( '######################### ');    
    
    const name = await pmd.getMarketName( 33 );
    console.log( 'market name ' + name );
    
    const driverNumber = await pmd.getDriverNumber( 33 );
    console.log( 'driver number ' + driverNumber );
    
    await pmd.devSetDriverNumber(33);
    
    const payout = await pmd.willPayout( 33 );
    console.log( 'will payout ? ' + payout );
    
    console.log( 'about to process' );
    await pmd.processResults();
    
     const payout2 = await pmd.willPayout( 33 );
    console.log( 'will payout ? ' + payout2 );
    
    const payout3 = await pmd.claim( account0, 33 );
    console.log( 'paying out ? ' + payout3 );
      
 //   expect( shares2 ).to.equal( 1 );



  });
});
