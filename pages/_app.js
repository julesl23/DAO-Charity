import '../styles/globals.css'
import App from 'next/app'
import { ethers } from 'ethers'
import BlockchainContext from '../src/BlockchainContext'
import Topbar from '../src/components/Topbar'

function MyApp({ Component, pageProps }) {
  const provider = new ethers.providers.JsonRpcProvider()
  const signerAdmin = provider.getSigner(0)
  //const signerAccount = provider.getSigner(1)

  return (
    <BlockchainContext.Provider value={{ provider, signerAdmin }}>
      <Topbar />

      <Component {...pageProps} />
    </BlockchainContext.Provider>
  )
}

export default MyApp
