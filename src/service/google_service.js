import { GoogleAuthFlow } from "../auth/google_auth.js"

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
    const { mediaItems, nextPageToken } = await this.requestGooglePhotosMedia()

    Promise.all(mediaItems.map((item) => {
      if (item.mimeType == 'image/jpeg') {
        this.requestGooglePhoto({
          media: item,
          access_token: this.credentials.token.access_token,
          dir: "/downloads"
        })
      }
    }))
  }

  async requestGooglePhotosMedia() {

    try {
      const { token: { access_token, refresh_token } } = this.credentials

      let media = await this.googleUtils.googleClientRequest({
        urlOptions: this.googleMediaRequest({ access_token })
      })

      if (JSON.parse(media).hasOwnProperty('error')) {
        const refresedToken = await this.googleUtils.googleClientRequest({
          urlOptions: this.googleAuth.authorizationToken({
            tokenRefresh: refresh_token,
            isExpired: true
          })
        })

        media = await this.googleUtils.googleClientRequest({
          urlOptions: this.googleMediaRequest({ access_token: JSON.parse(refresedToken).access_token })
        })
      }

      return JSON.parse(media)

    } catch (error) {
      throw error
    }
  }

  requestGooglePhoto({ media, access_token, dir }) {

    return new Promise(async (resolve, reject) => {
      const bufferImage = await this.googleUtils.googleClientRequestBuffer({
        urlOptions: new URL(`${media.baseUrl}=d`),
        headerOptions: this.googlePhotosHeaders({ token: access_token }),
      })

      try {

        console.log(`Download img: ${media.filename}`)
        this.googleUtils.googleSaveFileBuffer({
          path: dir,
          filename: media.filename,
          data: Buffer.concat([...bufferImage])
        })

        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  saveGooglePhoto({ buffer }) {

  }

  googleMediaRequest({ access_token }) {
    return this.googleUtils.googleUrlOptions({
      credentialOptions: new URL('https://photoslibrary.googleapis.com/v1/mediaItems'),
      headerOptions: this.googlePhotosHeaders({ token: access_token }),
      isOptions: true,
      method: 'GET'
    })
  }

  googlePhotosHeaders({ token }) {
    return {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

}
