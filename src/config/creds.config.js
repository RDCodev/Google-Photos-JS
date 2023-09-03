import 'dotenv/config'
import url, { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const filePath = join(__dirname, '../auth/credentials.json');
const { installed }  = JSON.parse(fs.readFileSync(filePath))

const authUrl = new URL(installed.auth_uri)
const authTokenUrl = new URL(installed.token_uri)

export function googlePhotosAuthConfig(code) {
  let urlToken = new URL(url.format({
    protocol: authTokenUrl.protocol,
    host: authTokenUrl.hostname,
    pathname: authTokenUrl.pathname,
    query: {
      code,
      client_id: installed.client_id,
      client_secret: installed.client_secret,
      redirect_uri: installed.redirect_uris[0],
      grant_type: 'authorization_code'
    }
  }))

  return {
    method: 'POST',
    hostname: urlToken.host,
    path: `${urlToken.pathname}${urlToken.search}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
}

export const urlAuthCodeRequest = url.format({
  protocol: authUrl.protocol,
  host: authUrl.host,
  pathname: authUrl.pathname,
  query: {
    scope: ['https://www.googleapis.com/auth/photoslibrary'],
    access_type: 'offline',
    include_granted_scopes: 'true',
    response_type: 'code',
    redirect_uri: installed.redirect_uris[0],
    client_id: installed.client_id
  }
})

export default {}