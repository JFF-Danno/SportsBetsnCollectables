import React, { useEffect, useState } from 'react'
import axios from 'axios';
import Web3 from 'web3';
import { ethers } from 'ethers';
import NFTABI from './NFTABI.js';
import ABI from'./ABI';
import './App.css';
import loading from'./images/loading.gif';
var web3 = new Web3(Web3.givenProvider);

const MintNFT = () => {

 const PredictionContractAddress = process.env.REACT_APP_PredictionMarketContract;
 const nftContractAddress = process.env.REACT_APP_NFTContract;
 
  const [img,  setimg                 ] = useState('');
  const [name, setName                ] = useState('');
  const [description, setDescription  ] = useState('');
  
  const getImageURL = async () => {
    var localAddress = await signer.getAddress();
    var PredictionContract = await new web3.eth.Contract( ABI, PredictionContractAddress, {from:localAddress} ); 
    let number = await PredictionContract.methods.drivernumber().call();
    setimg( 'http://localhost:8080/CardMaker?Action=Image&Driver=' + number );
    return 'http://localhost:8080/CardMaker?Action=Image&Driver=' + number;
  } 
  
  const getDataURL = async () => {
    var localAddress = await signer.getAddress();
    var PredictionContract = await new web3.eth.Contract( ABI, PredictionContractAddress, {from:localAddress} ); 
    let number = await PredictionContract.methods.drivernumber().call();
    return 'http://localhost:8080/CardMaker?Action=Data&Driver=' + number;
  } 
     
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
   
  const mint = async () => {
    document.getElementById( 'loading' ).style.display = 'block';
    const imgurl = await getImageURL();
    const config = { responseType: 'blob' };
    let resp = await axios.get(imgurl , config)
    let file = new File([resp.data], name + ".png" );       
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let   data = new FormData();
    data.append( "file", file, file.name );
    const res = await axios.post(   url, data, {  maxContentLength: "Infinity", 
      headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.REACT_APP_PINATA_PUBLIC,
        pinata_secret_api_key: process.env.REACT_APP_PINATA_PRIVATE,
        },
      });
    console.log( 'upload ' +  res.data );
     
    const metadatajson = { "name": name, "description": description,"file_uri": "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash };
  
    const urlJson = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const resMint = await axios.post( urlJson, metadatajson, {
      maxContentLength: "Infinity", headers: { "Content-Type": "application/json",
      pinata_api_key: process.env.REACT_APP_PINATA_PUBLIC, 
      pinata_secret_api_key: process.env.REACT_APP_PINATA_PRIVATE, 
      },   
    });
    console.log(resMint.data);
    const uri = 'https://gateway.pinata.cloud/ipfs/' + resMint.data.IpfsHash;
    var localAddress = await signer.getAddress();
    var NFTContract = await new web3.eth.Contract( NFTABI, nftContractAddress, {from:localAddress} ); 
    NFTContract.methods.createCollectible( uri ).send()
       .on("transactionHash",function(hash){
              console.log(hash);
          })
       .on("confirmation", function(confirmationNr){
              console.log(confirmationNr);
              window.location.replace("/wallet");

          })
       .on("receipt", async function(receipt){
              console.log(receipt);
             
         });  
  }

  const getData = async () => {
    let respData = await axios.get( await getDataURL() );
    setName( respData.data.race );
    setDescription( respData.data.description );
  }

 useEffect( () => {
     getImageURL();
     getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img])
 
  return (
    <div className="App" >
    <div id="connect" ><button id='connectButton' >Connected</button></div><br/><br/><br/>
      <div id="menu" ><a id='homelink' href='/' >HOME</a><a className='topmenu' href='/' >Pick Championship Winner</a><a className='topmenu' href='/' >Pick The Podium</a><a className='topmenu' href='/' >Pick The Points Winners</a> </div>

      <div id="imageDiv">
        <img id="preview" alt='preview' src={img} /><br/><br/>
        {name}<br/>
        {description}<br/>
        <button onClick={mint} >Mint</button>
        
      </div>
      <div id="loading" ><h1>Uploading to pinning service!</h1><img alt='loading' src={loading} /></div>
    </div>
  )
}
export default MintNFT
