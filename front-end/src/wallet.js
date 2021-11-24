import React, { useState , useEffect } from "react";
import moralis from "moralis";
import './App.css';
import { ethers } from 'ethers';

function App() {

 const [nftCards,     setNFTCards ] = useState([]);

 const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL; 
 const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID; 
 moralis.start({ serverUrl, appId });

 const nftContractAddress = process.env.REACT_APP_NFTContract;
      
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
 const getData = async () => {
  let  nftMetaData = [];
  let localAddress = await signer.getAddress();
  const nfts =    await moralis.Web3API.account.getNFTs({chain:"kovan",address:localAddress.toLowerCase(),token_address:nftContractAddress.toLowerCase()});
  for( let i = 0; i <  nfts.result.length ; i++ ) {
    nftMetaData.push(JSON.parse(nfts.result[i].metadata ));
  }
  const rows = nftMetaData.map((row,index) => 
    <div key={index} className='nfts'>
      <img src={row.file_uri}  alt={row.name} /><br/><h2>{row.name}</h2><h3>{row.description}</h3>
    </div>
    );
  setNFTCards(rows);
  }

  useEffect(  () => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="App">
     <div id="connect" ><button id='connectButton' >Connected</button></div><br/><br/><br/>
      <div id="menu" ><a id='homelink' href='/' >HOME</a><a className='topmenu' href='/' >Pick Championship Winner</a><a className='topmenu' href='/' >Pick The Podium</a><a className='topmenu' href='/' >Pick The Points Winners</a> </div>
      <div id='titleline' ><span className='title'>My Wallet</span></div><br/><br/>

      <div id="cards" >{nftCards}</div>
    </div>
  );
}

export default App;
