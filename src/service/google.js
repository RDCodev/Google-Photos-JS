import 'dotenv/config'
import url from 'url'
import fs from 'fs'
import http from 'http'
import open from 'open'
import https from 'https'

const GOOGLE_AUTH_TYPES = {
  installed: "installed",
}

export class GoogleService {

  credentialsFile = null
  credentials = null
  token = null
  auth2Code = null

  #authCodeUrl = null
  #authTokenURL = null

  server = http.createServer((req, res) => res.end())

  constructor() {
    this.server.listen(8080)
  }

  loadCredentials(pathFile) {

    try {
      const file = JSON.parse(fs.readFileSync(pathFile))

      if (file.hasOwnProperty('installed')) {
        this.credentialsFile = { ...file.installed }
        this.#authCodeUrl = new URL(this.credentialsFile.auth_uri)
        this.#authTokenURL = new URL(this.credentialsFile.token_uri)
      }

    } catch (error) {
      throw error
    }

  }

  async requestCredentials(scopes) {

    try {

      if (fs.existsSync('token.json')) {
        this.token = JSON.parse(fs.readFileSync('./token.json'))
      } else {
        this.auth2Code = await this.requestAuth2Code(scopes)
        this.token = await this.requestAuthToken(this.auth2Code, true)
      }

      return this.token
    } catch (error) {

    }

  }

  refreshAuthToken(save) {

    const tokenRefreshURI = new URL(url.format({
      protocol: this.#authTokenURL.protocol,
      host: this.#authTokenURL.hostname,
      pathname: this.#authTokenURL.pathname,
      query: {
        client_id: this.credentialsFile.client_id,
        client_secret: this.credentialsFile.client_secret,
        refresh_token: this.token.refresh_token,
        grant_type: 'refresh_token'
      }
    }))

    const options = {
      method: 'POST',
      hostname: `${tokenRefreshURI.host}`,
      path: `${tokenRefreshURI.pathname}${tokenRefreshURI.search}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    return new Promise((resolve, reject) => {

      const req = https.request(options, (res) => {

        let data = ""

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          data = JSON.parse(data)

          resolve(data)

          if (save) {
            fs.writeFileSync('./auth/token.json', JSON.stringify(data), 'utf-8')
          }
        })

        res.on('err', (err) => reject(err))
      })

      req.end()
    })
  }

  requestAuthToken(authCode, save) {

    const tokenURI = new URL(url.format({
      protocol: this.#authTokenURL.protocol,
      host: this.#authTokenURL.hostname,
      pathname: this.#authTokenURL.pathname,
      query: {
        code: authCode,
        client_id: this.credentialsFile.client_id,
        client_secret: this.credentialsFile.client_secret,
        redirect_uri: [...this.credentialsFile.redirect_uris],
        grant_type: 'authorization_code'
      }
    }))

    const options = {
      method: 'POST',
      hostname: tokenURI.host,
      path: `${tokenURI.pathname}${tokenURI.search}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    return new Promise((resolve, reject) => {

      let data = null

      const req = https.request(options, (res) => {
        res.on('data', chunk => {
          data = JSON.parse(chunk)
        })

        res.on('end', () => {
          resolve(data)

          if (save) {
            fs.writeFileSync('./auth/tokenRefresh.json', JSON.stringify(data), 'utf-8')
          }

        })

        res.on('error', err => reject(err))
      })

      req.end()
    })
  }

  requestAuth2Code(scopes) {

    const urlAuthCode = url.format({
      protocol: this.#authCodeUrl.protocol,
      host: this.#authCodeUrl.host,
      pathname: this.#authCodeUrl.pathname,
      query: {
        scope: [...scopes],
        access_type: 'offline',
        include_granted_scopes: 'true',
        response_type: 'code',
        redirect_uri: this.credentialsFile.redirect_uris,
        client_id: this.credentialsFile.client_id
      }
    })

    open(urlAuthCode, { app: 'google chrome' })

    return new Promise((resolve, reject) => {
      this.server.on('request', (req) => {
        const url = new URL(req.url, `http://${req.headers.host}`)

        if (url.searchParams.has('code')) {
          resolve(url.searchParams.get('code'))
        } else {
          reject(url.searchParams.get('error'))
        }
      })
    })

  }
}