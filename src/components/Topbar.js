import Link from 'next/link'
import React from 'react'

export default function Topbar() {
  return (
    <div>
      <div className="mt-8 text-center text-xl font-bold tracking-wide">
        DAO CHARITY
      </div>
      <div className="relative mx-auto mt-4 max-w-fit">
        <ul className="flex">
          <li className="mr-8 flex-1">
            <Link className="text-blue-500 hover:text-blue-800" href="/dao">
              DAO
            </Link>
          </li>
          <li className="mr-8 flex-1 whitespace-nowrap">
            <Link
              className="text-blue-500 hover:text-blue-800"
              href="/proposals/createProposal"
            >
              New Proposal
            </Link>
          </li>
          <li className="mr-2 flex-1 whitespace-nowrap">
            <Link className="text-blue-500 hover:text-blue-800" href="/votes">
              Votes
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
