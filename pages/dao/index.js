import React, { useEffect, useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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

export default function DAO() {
  const { uploadFile } = useSkynet()
  const { getUserAccountAddress } = useBlockchainInfo()

  const { daoUpdate } = useERC4824(process_env.DAO_ADDRESS)

  const [daoName, setDAOName] = useState('Charity DAO')
  const [description, setDescription] = useState(
    'Allocates funds to charities.'
  )
  const [endDate, setEndDate] = useState(format(Date.now(), 'yyyy-MM-dd'))
  const [governanceURI, setGovernanceURI] = useState()
  const [governance, setGovernance] = useState(
    `User can vote for, against or abstain.

   A proposal must have (strictly more "for" votes then "against" votes to pass.
   
   "For" and "abstain" votes count towards the quorum. "Against" votes don't.`
  )

  function submit_UpdateProposal(e) {
    e.preventDefault()
    ;(async () => {
      const metaDataFileObject2 = new File(
        [
          new Blob([governance], {
            lastModified: Date.now(),
            type: 'text/plain',
          }),
        ],
        'governance.jsonld'
      )
      const skylinkUrl2 =
        'https://siasky.net/AADZltLKQ8wKm247ONj1rcNrEphq-_vHFc-OXj6Oe6fA_w' //await uploadFile(metaDataFileObject2)

      const dao = {
        '@context': 'http://www.daostar.org/schemas',
        type: 'DAO',
        name: daoName,
        description,
        governanceURI: skylinkUrl2,
      }

      await daoUpdate(daoName, description, skylinkUrl2)
    })()
  }

  return (
    <div className="overflow-hidden bg-white py-16 px-4 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-xl">
        <h2 className="text-center text-xl font-bold">DAO</h2>

        <div className="border-t border-gray-200 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 rounded-lg border-2 border-palette1-light-purple p-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-md font-medium text-gray-500">DAO name</dt>
              <dd className="mt-2 text-lg">{daoName}</dd>
            </div>

            <div className="mt-2 sm:col-span-2">
              <dt className="text-md font-medium text-gray-500">description</dt>
              <dd className="mt-1 text-lg text-gray-900">{description}</dd>
            </div>
            <div className="sm:col-span-2">
              <label className="text-lg font-medium text-gray-500">
                Governance URI
              </label>
              <div className="mt-2 text-lg">{governanceURI}</div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-md font-medium text-gray-500">
                Governance
              </label>
              <div className="text-md mt-2">{governance}</div>
            </div>
          </dl>
        </div>
        <div className="mt-4 flex flex-1 justify-center">
          <button
            onClick={submit_UpdateProposal}
            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Update Proposal
          </button>
        </div>
      </div>
    </div>
  )
}
