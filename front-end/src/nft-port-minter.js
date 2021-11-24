import React, { useEffect, useState } from 'react'
import moralis from "moralis";
import axios from 'axios';

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const MintNFT = () => {
  // ----- useState
  const [imageHash,   setImageHash]   = useState('');
  const [imageUrl,    setImageUrl]    = useState('upload-image.png')
  const [message,     setMessage]     = useState('') 
  const [address,     setAddress]     = useState('Connect')
  const nftPortKey =  process.env.REACT_APP_NFTPortKey;
      

  const getImageURL = async () => {
      setImageUrl( 'http://localhost:3000/testcard.png' );
  } 

  const doMint = async () => {   
    setMessage( 'Uploading to IPFS!' );
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const config = { responseType: 'blob' };
    let resp = await axios.get(await getImageURL(), config)
    let file = new File([resp.data], "testaxios123.png" );   
    let   data = new FormData();
    data.append( "file", file, file.name );
    const res = await axios.post( url, data, {  maxContentLength: "Infinity", 
      headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.REACT_APP_PINATA_PUBLIC,
        pinata_secret_api_key: process.env.REACT_APP_PINATA_PRIVATE,
        },
      });
    console.log(res.data);
    setImageHash( res.data.IpfsHash );
    setImageUrl( 'https://gateway.pinata.cloud/ipfs/' + res.data.IpfsHash );
    setMessage( 'Successfully uploaded to IPFS. Now Minting NFT! Please Wait!' );
    const fileuri = "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash;
    const metadatajson = '{ "name": "GP Winner", "description": "GP Winner","file_uri": "' + fileuri + '" }';
    const metadataurl = 'https://api.nftport.xyz/ipfs_upload_metadata';
    const resMetaData = await axios.post( metadataurl, metadatajson, { headers: { "Content-Type": "application/json", "Authorization" : nftPortKey },   });
    console.log(resMetaData.data);
    const metadatauri = resMetaData.data.metadata_ipfs_uri;

    const contractAddress = "0x0AEe6e01D4bD12A9D80AA2fa64A2b53093FafDA7";
    const nftporturl = 'https://api.nftport.xyz/mint_nft';
    const mintData = { 
      "chain": "polygon",
      "contract_address": "0x0AEe6e01D4bD12A9D80AA2fa64A2b53093FafDA7", 
      "metadata_uri": metadatauri,
      "mint_to_address": address };
    const resMint = await axios.post(   nftporturl, mintData, {  maxContentLength: "Infinity", 
    headers: { "Content-Type": "application/json", "Authorization" : nftPortKey },   });
    console.log(resMint.data);
    const tokenurl = 'https://api.nftport.xyz/get_minted_nft?chain=polygon&transaction_hash=' + resMint.data.transaction_hash;
    const resToken = await axios.get(   tokenurl, { headers: { "Content-Type": "application/json", "Authorization" : nftPortKey },   });
    console.log(resToken.data);
    setMessage( 'Minting Complete!' );   
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
	
	const connect = async () => {
	  if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' }).then(handleAccountsChanged);
        setAddress(currentAccount);
        // eslint-disable-next-line no-console
      } catch (error) { console.log('error connecting to metamask '); }
    }
  }
  
  
 useEffect( () => {
      getImageURL();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
	
  return (
    <div className="App" >
    

      <div id="imageDiv">
        <img id="preview" alt={imageUrl} src={imageUrl} /><br/><br/>
        
    </div>
    
    <div id="form">
      
    

      <button id="mintButton" onClick={doMint} >Mint</button><br/><br/>
      <button onClick={connect} >Connect</button>

    </div>
   </div>
  )
}

export default MintNFT
