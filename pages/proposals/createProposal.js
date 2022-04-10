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

export default function CreateProposal() {
  const { uploadFile } = useSkynet()
  const { getUserAccountAddress } = useBlockchainInfo()

  const proposalId = useRef(uuidv4())

  const [startDate, setStartDate] = useState(format(Date.now(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(Date.now(), 'yyyy-MM-dd'))

  const { proposalUpdate, activityLogUpdate } = useERC4824(
    process_env.DAO_ADDRESS
  )

  const initialProposal = {
    id: proposalId.current,
    status: 'Active',
    startDate: format(Date.now(), 'yyyy-MM-dd'),
    endDate: format(Date.now(), 'yyyy-MM-dd'),
  }

  console.log(
    'CreateProposal: initialProposal.startDate = ',
    initialProposal.startDate
  )

  // form validation rules
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Title is required'),
    status: Yup.string().required('Status is required'),
    contentURI: Yup.string().required('Content URI is required'),
    startDate: Yup.date().min(new Date(), 'Please choose future date'),
    endDate: Yup.date().when('startDate', (startDate, schema) => {
      if (startDate) {
        const dayAfter = startDate

        return schema.min(dayAfter, 'End date has to be later than start date')
      }

      return schema
    }),
    calls: Yup.array().of(
      Yup.object().shape({
        operation: Yup.string().required('Operation is required'),
        from: Yup.string().required('From is required'),
        to: Yup.string().required('To is required'),
        value: Yup.string().required('Value is required'),
        data: Yup.string().required('Data is required'),
      })
    ),
  })

  const formOptions = {
    defaultValues: initialProposal,
    resolver: yupResolver(validationSchema),
  }

  const operation = ['call', 'delegate call']

  const ldFields = ['operation', 'from', 'to', 'value', 'data']
  const statuses = [
    'Pending',
    'Active',
    'Canceled',
    'Defeated',
    'Succeeded',
    'Queued',
    'Expired',
    'Executed',
  ]

  const voteChoice = ['For', 'Abstain', 'Against']

  // functions to build form returned by useForm() and useFieldArray() hooks
  const { register, control, handleSubmit, reset, formState, watch } =
    useForm(formOptions)
  const { errors } = formState
  const { fields, append, move, remove } = useFieldArray({
    name: 'calls',
    control,
  })

  function handleSubmit_Cancel(e) {
    e.preventDefault()
  }

  function handleSubmit_SaveCall(e) {
    e.preventDefault()

    append({
      operation: 'delegate call',
      from: '',
      to: '',
      value: '',
      data: '',
    })
  }

  function parseDateString(value, originalValue) {
    const parsedDate = isDate(originalValue)
      ? originalValue
      : parse(originalValue, 'yyyy-MM-dd', new Date())

    return parsedDate
  }

  async function onSubmit(data) {
    console.log('CreateProposal: data = ', data)

    const proposal = {
      '@context': 'http://www.daostar.org/schemas',
      dao: process_env.DAO_ADDRESS,
      '@id': data.id,
      '@type': 'proposal',
      name: data.name,
      contentURI: data.contentURI,
      status: 'Pending',
      startTimestamp: toTimestamp(startDate),
      endTimestamp: toTimestamp(endDate),
      calls: data.calls,
    }

    const metaDataFileObject = new File(
      [
        new Blob([JSON.stringify(proposal)], {
          lastModified: Date.now(),
          type: 'text/plain',
        }),
      ],
      'proposal.jsonld'
    )
    const skylinkUrl = await uploadFile(metaDataFileObject)

    // emit ERC4823 proposalUpdate event
    await proposalUpdate(proposal['@id'], skylinkUrl)
    const userAccountAddress = await getUserAccountAddress()

    ///////////////////
    const activityLog = {
      '@context': 'http://www.daostar.org/schemas',
      dao: process_env.DAO_ADDRESS,
      '@id': data.id,
      '@type': 'activity',
      proposal: {
        '@id': proposal['@id'],
        '@type': 'proposal',
        activity: 'submission',
      },
      member: {
        '@type': 'EthereumAddress',
        address: userAccountAddress,
      },
    }

    const metaDataFileObject2 = new File(
      [
        new Blob([JSON.stringify(activityLog)], {
          lastModified: Date.now(),
          type: 'text/plain',
        }),
      ],
      'acivityLog.jsonld'
    )
    const skylinkUrl2 = await uploadFile(metaDataFileObject2)
    await activityLogUpdate(activityLog['@id'], skylinkUrl2)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="overflow-hidden bg-white py-16 px-4 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-xl">
          <h2 className="text-center text-xl font-bold">New Proposal</h2>

          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 rounded-lg border-2 border-palette1-light-purple p-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-2">
                  <input
                    name={`name`}
                    {...register(`name`)}
                    type="text"
                    className="block w-full rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                  />
                </dd>
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                {errors.name?.message}
              </p>
              <div className="mt-2 sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Proposal ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {proposalId.current}
                </dd>
                <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                  {errors.id?.message}
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  Content URI
                </label>
                <div className="mt-2">
                  <input
                    name={`contentURI`}
                    {...register(`contentURI`)}
                    type="text"
                    className="mt-2 block w-full rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                  />
                </div>
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                {errors.contentURI?.message}
              </p>
              <div className="mx-auto flex max-w-2xl items-center justify-center space-x-4 py-2 sm:col-span-2">
                {/* <span className="font-medium text-gray-900">Default Components:</span> */}
                <div className="relative w-40">
                  <input
                    type="date"
                    name={`startDate`}
                    {...register(`startDate`)}
                  />
                </div>
                <div className="relative w-40">
                  <input type="date" {...register(`endDate`)} />
                </div>
              </div>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                {errors.startDate?.message}
              </p>
              <p className="mt-2 animate-[pulse_1s_ease-in-out_infinite] text-palette1-light-pink">
                {errors.endDate?.message}
              </p>
            </dl>
          </div>
          <div className="rounded-lg border-2 border-dashed border-palette1-light-purple p-4">
            <h3 className="text-center text-xl font-semibold underline">
              Calls
            </h3>

            <div className="divide-y-2 divide-dashed divide-palette1-light-purple">
              {fields.map((item, i) => (
                <div key={i} className="">
                  <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="grid grid-cols-3 px-4 py-5 sm:px-6">
                      <h3 className="col-span-1 text-lg font-medium leading-6 text-gray-900 sm:col-span-2">
                        Call
                      </h3>
                      <div className="flex flex-row justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (i > 0) move(i)
                          }}
                          className="mb-4 px-5"
                        >
                          <ArrowUpIcon
                            className="h-6 w-6 font-bold text-palette1-light-blue lg:h-6 lg:w-6"
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            {
                              if (i < fields.length - 1) move(i + 1)
                            }
                          }}
                          className="mb-4 px-5"
                        >
                          <ArrowDownIcon
                            className="h-6 w-6 font-bold text-palette1-light-blue lg:h-6 lg:w-6"
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(i)}
                          className="h-6 w-6 font-bold text-palette1-light-blue lg:h-6 lg:w-6"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">
                            Operation
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <select
                              id="operation"
                              name="operation"
                              {...register(`calls.${i}.operation`)}
                              className="mt-2 block rounded-md border-2 border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                            >
                              {operation.map((x, y) => (
                                <option key={y}>{x}</option>
                              ))}
                            </select>
                          </dd>
                        </div>
                        <div className="col-start-1 sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            from
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <input
                              name={`calls[${i}]from`}
                              {...register(`calls.${i}.from`)}
                              type="text"
                              className="{`form-control ${ errors.calls?.[i]?.from ? 'is-invalid' : '' }`} mt-2 block w-full truncate rounded-md
                            border-2 border-palette1-light-purple py-2 px-4 shadow-sm
                          focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">
                            to
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <input
                              name={`calls[${i}]to`}
                              {...register(`calls.${i}.to`)}
                              type="text"
                              className="{`form-control ${ errors.calls?.[i]?.to ? 'is-invalid' : '' }`} mt-2 block w-full truncate rounded-md
                            border-2 border-palette1-light-purple py-2 px-4 shadow-sm
                          focus:border-palette1-border-colour1 focus:ring-palette1-action-colour1"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">
                            value
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <input
                              name={`calls[${i}]value`}
                              {...register(`calls.${i}.value`)}
                              type="text"
                              className="{`form-control ${ errors.calls?.[i]?.value ? 'is-invalid' : '' }`} mt-2 block w-full rounded-md border-2
                            border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1
                          focus:ring-palette1-action-colour1"
                            />
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">
                            call data
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <input
                              name={`calls[${i}]data`}
                              {...register(`calls.${i}.data`)}
                              type="text"
                              className="{`form-control ${ errors.calls?.[i]?.data ? 'is-invalid' : '' }`} mt-2 block w-full rounded-md border-2
                            border-palette1-light-purple py-2 px-4 shadow-sm focus:border-palette1-border-colour1
                          focus:ring-palette1-action-colour1"
                            />
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-top-0 mt-2 text-center">
              <button
                onClick={handleSubmit_SaveCall}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                New Call
              </button>
            </div>
          </div>

          <div className="border-top-0 mt-8 flex flex-1 justify-center">
            <button
              onClick={handleSubmit_Cancel}
              className="mr-8 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel Proposal
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Proposal
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
