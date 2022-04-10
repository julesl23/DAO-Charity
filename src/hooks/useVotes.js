import React, { useContext } from 'react'
import { ethers, ContractFactory } from 'ethers'
import SimpleToken from '../../contracts/SimpleToken.json'
import GovernanceToken from '../../contracts/GovernanceToken.json'
import { process_env } from '../../pages/process_env'

import Web3Modal from 'web3modal'
import BlockchainContext from '../BlockchainContext'

export default function useVotes(governanceTokenAddress) {
  const blockchainContext = useContext(BlockchainContext)
  const { provider, signerAdmin } = blockchainContext

  const currenciesDecimalPlaces = 6

  const governanceToken = new ethers.Contract(
    process_env.GOVERNANCE_ADDRESS,
    GovernanceToken.abi,
    provider
  )

  const delegates = async (userAddress) => {
    console.log('userVotes: governanceToken = ', governanceToken.address)

    console.log('userVotes: delegates')

    const delegateAddress = await governanceToken.delegates(userAddress)
    console.log('userVotes: delegateAddress = ', delegateAddress)

    return delegateAddress
  }

  const getVotes = async (userAddress) => {
    if (!userAddress) return

    console.log('userVotes: governanceToken = ', governanceToken.address)

    console.log('userVotes: getVotes')

    const votesBN = await governanceToken.getVotes(userAddress)

    const votes = Number(ethers.utils.formatEther(votesBN.toString()))

    console.log('userVotes: votes = ', votes)

    return votes
  }

  const delegateVotes = async (userDelegateAddress) => {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)
    const signerAccountAddress = await signerAccount.getAddress()

    const governanceToken = new ethers.Contract(
      process_env.GOVERNANCE_ADDRESS,
      GovernanceToken.abi,
      provider
    )

    const governanceTokenBalanceBN = await governanceToken
      .connect(provider)
      .balanceOf(signerAccountAddress)

    if (governanceTokenBalanceBN.isZero()) {
      alert('No governance tokens to delegate.')
      return
    }

    await governanceToken.connect(signerAccount).delegate(userDelegateAddress)
  }

  return {
    delegates,
    getVotes,
    delegateVotes,
  }
}
