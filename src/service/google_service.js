import { GoogleAuthFlow } from "../auth/google_auth.js"
import { GoogleUtils } from "../utils/google.utils.js"

export class GoogleService {

  credentials = null

  constructor() { }
}

export default class GoogleServicePhoto extends GoogleService {

  constructor(path) {
    super()
    this.path = path
    this.googleAuth = new GoogleAuthFlow()
    this.googleUtils = this.googleAuth.getGoogleUtils()
  }

  async backupGooglePhotos() {
    this.credentials = await this.googleAuth.requestAuthClient({ pathFile: this.path, isSave: true })
    const googleMedia = await this.requestGooglePhotosMedia()
    
  }

  async requestGooglePhotosMedia() {

    try {
      const { token: { access_token, refresh_token } } = this.credentials

      const media = await this.googleUtils.googleClientRequest({
        urlOptions: this.googleMediaRequest({ access_token })
      })

      if (JSON.parse(media).hasOwnProperty('error')) {
        const refresedToken = await this.googleUtils.googleClientRequest({
          urlOptions: this.googleAuth.authorizationToken({
            tokenRefresh: refresh_token,
            isExpired: true
          })
        })
        
        return await this.googleUtils.googleClientRequest({
          urlOptions: this.googleMediaRequest({ access_token: JSON.parse(refresedToken).access_token })
        })
      }

      return media

    } catch (error) {
      throw error
    }
  }

  requestGooglePhoto({ photoUri }) {

  }

  saveGooglePhoto({ buffer }) {

  }

  googleMediaRequest({ access_token }) {
    return this.googleUtils.googleUrlOptions({
      credentialOptions: new URL('https://photoslibrary.googleapis.com/v1/mediaItems'),
      headerOptions: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      isOptions: true,
      method: 'GET'
    })
  }

}
