import { GOOGLE_PHOTOS_SCOPES, GOOGLE_QUERY_OAUTH, GOOGLE_QUERY_REFRESH_TOKEN, GOOGLE_QUERY_TOKEN } from "../models/google_types.models.js"
import { GoogleUtils } from "../utils/google.utils.js"

export class GoogleAuth {

  credentialsFile = null
  googleAuth = {
    token: null,
    auth2Code: null
  }

  constructor() {
    this.googleUtils = new GoogleUtils()
  }

  loadGoogleCredentials({ path }) {
    try {
      this.credentialsFile = this.googleUtils.googleReadFile({ path })
    } catch (error) {
      throw error
    }
  }

  authFlowParams() {

    let oauthParams = null

    if (this.credentialsFile.installed) {
      const { installed } = this.credentialsFile
      const googleQuery = GOOGLE_QUERY_OAUTH

      googleQuery.scope = [GOOGLE_PHOTOS_SCOPES.full_access]
      googleQuery.redirect_uri = [...installed.redirect_uris]
      googleQuery.client_id = installed.client_id

      oauthParams = this.googleUtils.googleUrlOptions({
        credentialOptions: new URL(installed.auth_uri),
        queryOptions: googleQuery,
        isOptions: false
      })
    }

    return oauthParams
  }

  authorizationToken({ authCode, tokenRefresh, isExpired }) {
    let queryToken = null
    const { installed } = this.credentialsFile

    if (tokenRefresh && isExpired) {
      queryToken = GOOGLE_QUERY_REFRESH_TOKEN
      
      queryToken.client_id = installed.client_id
      queryToken.client_secret = installed.client_secret
      queryToken.refresh_token = tokenRefresh
    }

    if (authCode) {
      queryToken = GOOGLE_QUERY_TOKEN

      queryToken.code = authCode
      queryToken.client_id = installed.client_id,
      queryToken.client_secret = installed.client_secret,
      queryToken.redirect_uri = [...installed.redirect_uris]
    }

    return this.googleUtils.googleUrlOptions({
      credentialOptions: new URL(installed.token_uri),
      queryOptions: queryToken,
      isOptions: true
    })
  }


}

export class GoogleAuthFlow extends GoogleAuth {

  constructor() {
    super()
  }

  async requestAuthClient({ pathFile, isSave }) {
    try {

      if (this.googleUtils.googleCheckFile({ path: '/src/data/auth_credentials.json' })) {
        this.loadGoogleCredentials({ path: pathFile })
        this.googleAuth = this.googleUtils.googleCheckFile({ path: '/src/data/auth_credentials.json' })
        return this.googleAuth
      }

      this.loadGoogleCredentials({ path: pathFile })
      this.googleAuth.auth2Code = await this.googleUtils.googleServerRequest({ urlOptions: this.authFlowParams() })
      this.googleAuth.token = await JSON.parse(
        this.googleUtils.googleClientRequest({
          urlOptions: this.authorizationToken({
            authCode: this.googleAuth.auth2Code
          })
        })
      )

      if (isSave) this.googleUtils.googleSaveFile({
        path: 'src/data/',
        filename: 'auth_credentials.json',
        data: this.googleAuth
      })

      return this.googleAuth

    } catch (error) {
      throw error
    }
  }

  refreshAuthClient() {

  }

  getGoogleUtils() {
    return this.googleUtils
  }
}