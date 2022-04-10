import React, { useEffect, useState, useRef } from 'react'
import { useForm, useFieldArray, useFormState } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid'
import { v4 as uuidv4 } from 'uuid'
import useSkynet from '../../src/hooks/useSkynet'
import useERC4824 from '../../src/hooks/useERC4824'
import { format } from 'date-fns'
import { toTimestamp } from '../../src/utils/toTimestamp'
import { process_env } from '../process_env'
import useBlockchainInfo from '../../src/hooks/useBlockchainInfo'
import useGovernanceTokens from '../../src/hooks/useGovernanceTokens'
import useVotes from '../../src/hooks/useVotes'

export default function Votes() {
  const { uploadFile } = useSkynet()
  const { getUserAccountAddress } = useBlockchainInfo()

  const { getVotes, delegates, delegateVotes } = useVotes(
    process_env.GOVERNANCE_ADDRESS
  )

  const { memberUpdate } = useERC4824(process_env.DAO_ADDRESS)

  const [amount, setAmount] = useState(0)
  const [votingPower, setVotingPower] = useState()
  const [delegateAddress, setDelegateAddress] = useState()

  const { buyGovernanceTokens, getGovernanceTokenBalance } =
    useGovernanceTokens(process_env.GOVERNANCE_ADDRESS)

  const governanceTokenAmountMax = 24

  const governanceSchema = Yup.object().shape({
    governanceTokenAmount: Yup.string()
      .max(
        governanceTokenAmountMax,
        `Amount input too long - up to ${governanceTokenAmountMax} characters`
      )
      .required('Must input a governance token amount to purchase'),
  })

  const { register, control, handleSubmit, reset, formState, watch } = useForm({
    defaultValues: {
      governanceTokenAmount: 0,
    },
    resolver: yupResolver(governanceSchema),
  })

  function submit_BuyToken(data) {
    ;(async () => {
      const userAccountAddress = await getUserAccountAddress()

      const governanceTokenBalanceBefore = await getGovernanceTokenBalance(
        userAccountAddress
      )

      await buyGovernanceTokens(data.governanceTokenAmount)
      await delegateVotes(userAccountAddress)

      setVotingPower(await getVotes(userAccountAddress))
      setDelegateAddress(await delegates(userAccountAddress))

      const memberJSONLD = {
        '@context': 'http://www.daostar.org/schemas',
        dao: process_env.DAO_ADDRESS,
        '@type': 'EthereumAddress',
        address: userAccountAddress,
      }

      const metaDataFileObject2 = new File(
        [
          new Blob([JSON.stringify(memberJSONLD)], {
            lastModified: Date.now(),
            type: 'text/plain',
          }),
        ],
        'member.jsonld'
      )
      const skylinkUrl2 = await uploadFile(metaDataFileObject2)

      if (governanceTokenBalanceBefore.isZero)
        await memberUpdate(userAccountAddress, skylinkUrl2)
    })()
  }

  useEffect(() => {
    ;(async () => {
      const userAccountAddress = await getUserAccountAddress()

      setVotingPower(await getVotes(userAccountAddress))
      setDelegateAddress(await delegates(userAccountAddress))
    })()
  }, [])

  return (
    <div>
      <form onSubmit={handleSubmit(submit_BuyToken)}>
        <div className="overflow-hidden bg-white py-8 px-4 sm:px-6 lg:px-8 lg:py-12">
          <div className="relative mx-auto max-w-xl">
            <h2 className="text-center text-xl font-bold">Governance Tokens</h2>

            <div className="border-t border-gray-200 py-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 rounded-lg border-2 border-palette1-light-purple p-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Buy Tokens
                  </dt>
                  <dd className="mt-2">
                    <input
                      {...register(`governanceTokenAmount`)}
                      placeholder={`Amount of tokens to purchase`}
                      className="block w-full rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                    />
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Token price
                  </dt>
                  <dd className="mt-2">
                    {process_env.GOVERNANCE_TOKEN_PRICE}{' '}
                    {process_env.BASE_CURRENCY}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-2 flex flex-1 justify-center">
              <button
                type="submit"
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Buy Token
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="border-t border-gray-200">
        <div className="relative mx-auto max-w-xl">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 rounded-lg border-2 border-palette1-light-purple p-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Voting Power
              </dt>
              <dd className="mt-2">{votingPower}</dd>
            </div>
          </dl>
          <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 rounded-lg border-2 border-palette1-light-purple p-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Delegate Address
              </dt>
              <dd className="mt-2">{delegateAddress}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
