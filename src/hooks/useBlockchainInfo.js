import React, { useContext } from 'react'
import { ethers } from 'ethers'

import Web3Modal from 'web3modal'
import { process_env } from '../../pages/process_env'
import BlockchainContext from '../../src/BlockchainContext'
import ERC4824 from '../../contracts/ERC4824.json'

export default function useBlockchainInfo() {
  const blockchainContext = useContext(BlockchainContext)
  const { provider, signerAdmin, signerAccount } = blockchainContext

  const getUserAccountAddress = async (name, description, membersURI) => {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)
    const signerAccountAddress = await signerAccount.getAddress()

    return signerAccountAddress
  }

  return {
    getUserAccountAddress,
  }
}
