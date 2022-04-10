import React, { useContext } from 'react'
import { ethers } from 'ethers'

import Web3Modal from 'web3modal'
import { process_env } from '../../pages/process_env'
import BlockchainContext from '../../src/BlockchainContext'
import ERC4824 from '../../contracts/ERC4824.json'

export default function useERC4824(doaAddress) {
  const blockchainContext = useContext(BlockchainContext)
  const { provider, signerAdmin, signerAccount } = blockchainContext

  const erc4824 = new ethers.Contract(
    process_env.ERC4824_ADDRESS,
    ERC4824.abi,
    provider
  )

  const daoUpdate = async (name, description, governanceURI) => {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)

    await erc4824
      .connect(signerAccount)
      .daoUpdate(doaAddress, name, description, governanceURI)
  }

  const memberUpdate = async (member, memberURI) => {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)

    await erc4824
      .connect(signerAccount)
      .memberUpdate(doaAddress, member, memberURI)
  }

  const proposalUpdate = async (proposalId, proposalURI) => {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)

    await erc4824
      .connect(signerAccount)
      .proposalUpdate(doaAddress, proposalId, proposalURI)
  }

  const activityLogUpdate = async (activityId, activityLogURI) => {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)

    await erc4824
      .connect(signerAccount)
      .activityLogUpdate(doaAddress, activityId, activityLogURI)
  }

  const governanceUpdate = async (goveranceURI) => {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)

    await erc4824
      .connect(signerAccount)
      .governanceUpdate(doaAddress, goveranceURI)
  }

  return {
    daoUpdate,
    memberUpdate,
    proposalUpdate,
    activityLogUpdate,
    governanceUpdate,
  }
}
