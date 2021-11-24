import React, { useState , useEffect } from "react";
import './App.css';
import ABI from'./ABI';
import Web3 from 'web3';
import { ethers } from 'ethers';
import moralis from "moralis";
import card33 from './images/max.jpg';
import card44 from './images/lewis.jpg';
import card77 from './images/Valtteri.jpg';
import card11 from './images/sergio.jpg';
import card4 from './images/lando.jpg';
import card16 from './images/charles.jpg';
import card55 from './images/carlos.jpg';
import card3 from './images/daniel.jpg';
import card10 from './images/pieree.jpg';

var web3 = new Web3(Web3.givenProvider);

function App() {
  
 const [total,        setTotal       ] = useState('');
 const [totalwei,     setTotalWei    ] = useState('');
 const [cards,        setCards       ] = useState('');
 const [userAddress,  setAddress     ] = useState(null);
 const [usdConversion, setUsdPrice   ] = useState(0);
 
 const [mintButtonText,  setMintButtonText ] = useState('Waiting For VRF');
 const [lightsImage,     setLightsImage ] = useState('lights.png');

 const provider = new ethers.providers.Web3Provider(window.ethereum);
 const signer = provider.getSigner();
 const PredictionContractAddress = process.env.REACT_APP_PredictionMarketContract;
 const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
 const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
 moralis.start({ serverUrl, appId });
 
 //const usdConversion = 4482.85;
 
 const driverNumbers = [33,44,77,16,11,4,55,3,10];
 const driverNames = ['Max Verstappen','Lewis Hamilton','Valtteri Bottas','Charles Leclerc','Sergio Perez','Lando Norris','Carlos Sainz','Daniel Ricciardo','Pierre Gasly'];
 const cardImages = [card33,card44,card77,card16,card11,card4,card55,card3,card10];
 
 const getUSDValue = async () => {
  //Get token price on PancakeSwap v2 BSC
  const options = {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chain: "eth",
    exchange: "uniswap-v3"
  };
  const price = await moralis.Web3API.token.getTokenPrice(options);
  setUsdPrice(price.usdPrice);
 }
 
 const checkVRF = async (PredictionContract,address) => {
  const random =  await PredictionContract.methods.vrfRandoms(address).call();
  return random;
 }
  
 const buyWithEth = async (PredictionContract,_marketId) => {
    let price = await PredictionContract.methods.getSharePrice(_marketId).call();
    let tokens = document.getElementById( 'shares' + _marketId ).value;
    var config = { value: tokens * price };
    PredictionContract.methods.buyShares( _marketId, tokens ).send(config)
       .on("transactionHash",function(hash){
              console.log(hash);
              
          })
       .on("confirmation", function(confirmationNr){
              

          })
       .on("receipt", async function(receipt){
              console.log(receipt);
              getCards();
         });
  }

   const getSharePrice = async (PredictionContract,number) => {
     return "$" + ( web3.utils.fromWei( (await PredictionContract.methods.getSharePrice(number).call()).toString() ) * usdConversion ).toFixed(2);
   }

 /*  const getClaimAmount = async (number) => {
   const localAddress = await signer.getAddress();
   const PredictionContract = await new web3.eth.Contract( ABI, PredictionContractAddress, {from:localAddress} ); 
     let claim = await PredictionContract.methods.claimAmount(localAddress,number).call();
     return  "$" + ( web3.utils.fromWei( claim.toString() ) * usdConversion ).toFixed(2);
   }*/

   const ClaimPrize = async (number) => {
            
      const localAddress = await signer.getAddress();
      const PredictionContract = await new web3.eth.Contract( ABI, PredictionContractAddress, {from:localAddress} ); 
      const vrfResult = await checkVRF(PredictionContract,localAddress);
      PredictionContract.methods.claim(localAddress,number).send() 
        .on("transactionHash",function(hash){
              console.log(hash);
              document.getElementById('lights').src='/lights-anim.gif';      
          })
       .on("confirmation", function(confirmationNr){
              console.log(confirmationNr);
                     
        })
       .on("receipt", async function(receipt){
              console.log(receipt);
               if ( vrfResult > 4 ) {
              
                document.getElementById('lights').src='/lights-anim-stop.gif';
                document.getElementById('mintbutton').innerHTML='Sorry Try Again Next Race';
                document.getElementById('mintbutton').disabled='disabled';
              } else {
                document.getElementById('lights').src='/lights1.png';
                document.getElementById('mintbutton').innerHTML='Mint NFT';
                document.getElementById('mintbutton').removeAttribute("disabled");
              } 
              document.getElementById('claimbutton').disabled='disabled';
         });;
   }
   
   const isOpen = async (PredictionContract) => {
     let claim = await PredictionContract.methods.marketsOpen().call();
     return  claim;
   }
   

  const getCards = async () => {
    
    const localAddress = await signer.getAddress();
    const PredictionContract = await new web3.eth.Contract( ABI, PredictionContractAddress, {from:localAddress} ); 
    
      if ( await isOpen(PredictionContract) ) {
        getCardsOpen(PredictionContract);
      } else {
        getCardsClosed(PredictionContract);
      }
    
  }
  
   const getCardsClosed = async (PredictionContract) => {  
    getTotal();
    const localAddress = await signer.getAddress();
    let driverNumberWinner = await PredictionContract.methods.drivernumber().call();
    let canClaim = await PredictionContract.methods.claimed(localAddress).call() || await PredictionContract.methods.canClaim().call();
    for( let i = 0; i < driverNumbers.length; i++ ) {
      if ( driverNumbers[i] == driverNumberWinner ) {
        if ( canClaim ) {
            let claimAmount = "$" + ( web3.utils.fromWei( await PredictionContract.methods.claimAmount(localAddress,driverNumberWinner).call() ) * usdConversion ).toFixed(2);
          setCards( <div><div id='winner'><img alt={driverNumbers[i]} src={cardImages[i]} /><div id='winnerControls'><h1>Congratulations!</h1><h2>You have winnings to claim!</h2><h2>{claimAmount}</h2><button  type='button' id='claimbutton' onClick={() => {ClaimPrize(driverNumberWinner);}} >Claim Winnings</button><br/><br/>
            <div id='minter' ><img  id='lights' alt='lights' src={lightsImage} /><br/><br/><a href='/mint'><button disabled id='mintbutton' type='button' >{mintButtonText}</button></a></div></div></div><div id='instructions' ><h2>Congratualtions! You can now claim your share of the prize pool.</h2><h3>Claim your prize and see if you've won the opportunity to mint this race's commemorative collectable NFT.</h3></div></div> );
        } else {
          setCards( <div id='winner'><img alt={driverNumbers[i]} src={cardImages[i]} /><div id='winnerControls'><h1>Sorry, nothing to claim!</h1><h1>Try again next race.</h1></div></div> ); 
        }
      }
    }
  }
  
  const getCardsOpen = async (PredictionContract) => {  
    getTotal();
    const cardRows = [];
    for( let i = 0; i < driverNumbers.length; i++ ) {
      cardRows.push( {name: driverNames[i], number: driverNumbers[i], image: cardImages[i], price : await getSharePrice(PredictionContract,driverNumbers[i]), shares : await PredictionContract.methods.getSharesSold(driverNumbers[i]).call(), owned: await PredictionContract.methods.getSharesOwned(driverNumbers[i]).call() } );
    }
    const rows = cardRows.map((row,index) => 
      <div className='card-panel' key={index} id={'card' + row.number}>
        <img className='card-image' src={row.image} alt={row.image}  />
        <div id={'cardcontrol' + row.number} className='cardcontrols'>
          <h2>{row.name}</h2>
          <h4>Share Price {row.price}</h4>
          <h4>Shares Sold {row.shares}</h4>
          <h4>You Hold {row.owned}</h4>
          <input id={'shares' + row.number} placeholder='0' type='text' /> &nbsp;
           <button onClick={() => {buyWithEth(PredictionContract,row.number)}} >Buy Shares</button>
        </div></div>
    
      );
      setCards(rows);
  }
  
  const getTotal = async () => {
    setTotalWei(await web3.eth.getBalance( PredictionContractAddress ));
    setTotal( '$' + ( web3.utils.fromWei( await web3.eth.getBalance( PredictionContractAddress )  ) * usdConversion ).toFixed(2) );
  }
  
 useEffect(() => {
   
    getUSDValue();
    getCards()
            
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdConversion])
  
  async function login() {
  let user = moralis.User.current();
  if (!user || ! userAddress) {
    user = await moralis.authenticate({ signingMessage: "Log in using Moralis" })
      .then(function (user) {
        console.log("logged in user:", user);
        console.log(user.get("ethAddress"));
      ///  setAddress( user.get("ethAddress") );
      document.getElementById('connectButton').innerHTML='Connected';
    })
    .catch(function (error) {
    console.log(error);
      });
    }
  }

  const { ethereum } = window;
	let currentAccount = null;
	function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
    } else if (accounts[0] !== currentAccount) {
      [currentAccount] = accounts;
      setAddress(currentAccount);
      
    }
  }
	ethereum.on('accountsChanged', handleAccountsChanged);
	 
  return (
    <div className="App">
      <div id="connect" ><button id='connectButton' onClick={login} >Connect Wallet</button></div><br/><br/><br/>
      <div id="menu" ><a id='homelink' href='/' >HOME</a><a className='topmenu' href='/' >Pick Championship Winner</a><a className='topmenu' href='/' >Pick The Podium</a><a className='topmenu' href='/' >Pick The Points Winners</a> </div>
      <div id='titleline' ><span className='title'>Who will win the Qatar Grand Prix?</span><span id='prizepool'>Total Prize Pool <span id='dollars'>{total}</span></span></div>
      <div id="cards" >{cards}</div>
    </div>
  );
}

export default App;
