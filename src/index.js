import http from 'http'
import https from 'https'
import open from 'open'
import fs from 'fs'

const GOOGLE_AUTH_TYPES = {
  installed: "installed"
}

const GOOGLE_QUERY_OAUTH = {
  scope: [],
  access_type: 'offline',
  include_granted_scopes: 'true',
  response_type: 'code',
  redirecct_uri: null,
  client_id: null
}

const GOOGLE_QUERY_TOKEN = {
  code: null,
  client_id: null,
  client_secret: null,
  redirect_uri: [],
  grant_type: 'authorization_code'
}

const GOOGLE_QUERY_REFRESH_TOKEN = {
  client_id: null,
  client_secret: null,
  refresh_token: null,
  grant_type: 'refresh_token'
}

export class GoogleService {

  credentials = null

  constructor() { }
}

export class GoogleAuth {

  credentialsFile = null
  googleAuth = {
    token: null,
    auth2Code: null
  }

  constructor(googleUtils) {
    this.googleUtils = googleUtils
  }

  loadGoogleCredentials({ path = "" }) {
    try {
      this.credentialsFile = JSON.parse(fs.readFileSync(path))
    } catch (error) {
      throw error
    }
  }
}

export class GoogleAuthFlow extends GoogleAuth {

  constructor(googleUtils) {
    super(googleUtils)
  }

  requestAuthClient({ pathFile, isSave }) {
    try {
      this.loadGoogleCredentials({ pathFile })
      this.googleAuth.auth2Code = this.googleUtils.googleServerRequest()
      this.googleAuth.token = this.googleUtils.googleClientRequest()

      if (isSave) this.googleUtils.googleSaveFile()

      return this.googleAuth
    } catch (error) {
      throw error
    }
  }

  refreshAuthClient() {

  }
}

export class GoogleServicePhoto extends GoogleService {

}

export class GoogleUtils {

  server = null
  client = null

  constructor() {
    this.server = http.createServer().listen(8080)
  }

  googleServerRequest({ urlOptions, app = 'google chrome' }) {
    open(urlOptions, { app })

    this.server.on('request', (req) => {
      const url = new URL(req.url, `http://${req.headers.host}`)

      if (!url.searchParams.has('code')) throw new Error('Auth2Code Error')
      return url.searchParams.get('code')
    })

    this.server.end()
  }

  googleClientRequest({ urlOptions }) {

    let buffer = ""

    https.request(urlOptions, (res) => {
      res.on('data', chunk => buffer += chunk)
      res.on('end', () => { return JSON.parse(buffer) || new Error() })
      res.on('error', err => { throw err })
    }).end()
  }

  googleSaveFile({ path, data, fileName }) {
    try {
      fs.writeFileSync(`${path}/${fileName}`, data, 'utf-8')
    } catch (error) {
      throw error
    }
  }

  googleReadFile({ path }) {
    try {
      return JSON.parse(fs.readFileSync(path))
    } catch (error) {
      throw error
    }
  }

  googleUrlOptions({ credentialOptions, queryOptions, headerOptions, isOptions }) {
    const uri = new URL(url.format({
      protocol: credentialOptions.protocol,
      host: credentialOptions.hostname,
      pathname: credentialOptions.pathname,
      query: queryOptions
    }))

    const options = {
      method: 'POST',
      hostname: uri.host,
      path: uri.pathname + uri.search,
      headers: headerOptions
    }

    return !isOptions ? uri : options
  }
}