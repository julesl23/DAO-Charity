import React from 'react'
import { SkynetClient } from 'skynet-js'
import { process_env } from '../../pages/process_env'

export default function useSkynet() {
  const portal = process_env.MEDIA_PORTAL

  // Initiate the SkynetClient
  const client = new SkynetClient(portal)

  console.log('client = ', client)

  async function uploadFile(acceptedFile) {
    const { skylink } = await client.uploadFile(acceptedFile)
    const skylinkUrl = await client.getSkylinkUrl(skylink)
    return skylinkUrl
  }

  async function downloadFile(uri) {
    const { skylink } = await client.getFileContent(uri)

    let content
    try {
      const { data, contentType, metadata, skylink } =
        await client.getFileContent(governanceURI)
      content = data
    } catch (error) {
      console.log(error)
    }

    return content
  }

  return { uploadFile, downloadFile }
}
