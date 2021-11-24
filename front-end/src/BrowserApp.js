import React, { Component } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


import Minter from "./minter";
import NFTPortMinter from './nft-port-minter';
import Wallet from "./wallet";
import MainPage from "./App";

class App extends Component {
  render() {
    return (<div className="app">
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route  path="/wallet" element={<Wallet />} />
                  <Route  path="/mint" element={<Minter />} />
                  <Route  path="/nftportmint" element={<NFTPortMinter />} />
                  
                </Routes>
              </BrowserRouter>
            </div>
           )
     }
}
export default App;

