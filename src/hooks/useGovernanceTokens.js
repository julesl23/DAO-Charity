import React, { useContext } from 'react'
import { ethers, ContractFactory } from 'ethers'
import SimpleToken from '../../contracts/SimpleToken.json'
import GovernanceToken from '../../contracts/GovernanceToken.json'
import { process_env } from '../../pages/process_env'
import ERC4824 from '../../contracts/ERC4824.json'

import Web3Modal from 'web3modal'
import BlockchainContext from '../BlockchainContext'

export default function useGovernanceTokens(governanceTokenAddress) {
  const blockchainContext = useContext(BlockchainContext)
  const { provider, signerAdmin } = blockchainContext

  const currenciesDecimalPlaces = 6

  const governanceToken = new ethers.Contract(
    process_env.GOVERNANCE_ADDRESS,
    GovernanceToken.abi,
    provider
  )

  const erc20Token = new ethers.Contract(
    process_env.USDC_ADDRESS,
    SimpleToken.abi,
    provider
  )

  // price 10 USDC
  const governanceTokensPrice = ethers.utils.parseUnits(
    process_env.GOVERNANCE_TOKEN_PRICE,
    6
  )

  const buyGovernanceTokens = async (amount) => {
    console.log(
      'useGovernanceTokens: governanceToken = ',
      governanceToken.address
    )

    const totalValue = ethers.utils
      .parseEther(amount)
      .mul(governanceTokensPrice)
      .div(ethers.utils.parseEther('1'))

    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })

    const connection2 = await web3Modal.connect()
    const provider2 = new ethers.providers.Web3Provider(connection2)
    const signerAccount = provider2.getSigner(0)

    const signerAccountAddress = await signerAccount.getAddress()
    const signerAdminAddress = await signerAdmin.getAddress()

    await erc20Token
      .connect(signerAccount)
      .approve(signerAdminAddress, totalValue)

    const allowance = await erc20Token.allowance(
      signerAccountAddress,
      signerAdminAddress
    )
    console.log('useGovernanceTokens: allowance = ', allowance)

    if (!allowance || allowance.lt(totalValue)) {
      alert('Not enough ERC-20 balance left.')
      return
    }

    const numOfgovernanceTokensBefore =
      governanceToken.balanceOf(signerAccountAddress)
    console.log(
      'useGovernanceTokens: numOfgovernanceTokensBefore = ',
      numOfgovernanceTokensBefore
    )

    console.log(
      'useGovernanceTokens: signerAdminAddress = ',
      signerAdminAddress
    )

    await erc20Token
      .connect(signerAccount)
      .transfer(signerAdminAddress, totalValue)

    await governanceToken
      .connect(signerAdmin)
      .transfer(signerAccountAddress, ethers.utils.parseEther(amount))
  }

  const getGovernanceTokenBalance = async (userAccountAddress) => {
    console.log(
      'useGovernanceTokens: governanceToken = ',
      governanceToken.address
    )

    const balance = await governanceToken.balanceOf(userAccountAddress)

    return balance
  }

  return {
    buyGovernanceTokens,
    getGovernanceTokenBalance,
  }
}
