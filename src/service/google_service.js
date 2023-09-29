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

  async backupGooglePhotos(nextPage) {

    this.credentials = await this.googleAuth.requestAuthClient({ pathFile: this.path, isSave: true })
    const { mediaItems, nextPageToken } = await this.requestGooglePhotosMedia(nextPage)

    await Promise.all(mediaItems.map( async (item) => {
      if (item.mimeType == 'image/jpeg') {
        return await this.requestGooglePhoto({
          media: item,
          access_token: this.credentials.token.access_token,
          dir: "/downloads"
        })
      }

      return true
    }))

    if(nextPageToken){
      this.backupGooglePhotos(nextPageToken)
    }
  }

  async requestGooglePhotosMedia(next) {

    try {
      const { token: { access_token, refresh_token } } = this.credentials

      let media = await this.googleUtils.googleClientRequest({
        urlOptions: this.googleMediaRequest({ access_token, nextPageToken: next }) 
      })

      if (JSON.parse(media).hasOwnProperty('error')) {

        const refresedToken = await this.googleUtils.googleClientRequest({
          urlOptions: this.googleAuth.authorizationToken({
            tokenRefresh: refresh_token,
            isExpired: true
          })
        })

        media = await this.googleUtils.googleClientRequest({
          urlOptions: this.googleMediaRequest({ access_token: JSON.parse(refresedToken).access_token, nextPageToken: next })
        })
      }

      return JSON.parse(media)

    } catch (error) {
      throw error
    }
  }

  requestGooglePhoto({ media, access_token, dir }) {

    return new Promise(async (resolve, reject) => {
      try {
        const bufferImage = await this.googleUtils.googleClientRequestBuffer({
          urlOptions: new URL(`${media.baseUrl}=d`),
          headerOptions: this.googlePhotosHeaders({ token: access_token }),
        })

        console.log(`Download img: ${media.filename}`)

        await this.googleUtils.googleSaveFileBuffer({
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

  googleMediaRequest({ access_token, nextPageToken }) {    
    
    if(nextPageToken != null){
      return this.googleUtils.googleUrlOptions({
        credentialOptions: new URL(`https://photoslibrary.googleapis.com/v1/mediaItems`),
        queryOptions: {pageToken:nextPageToken},
        headerOptions: this.googlePhotosHeaders({ token: access_token }),
        isOptions: true,
        method: 'GET'
      })
    }else{
      return this.googleUtils.googleUrlOptions({
        credentialOptions: new URL('https://photoslibrary.googleapis.com/v1/mediaItems'),
        headerOptions: this.googlePhotosHeaders({ token: access_token }),
        isOptions: true,
        method: 'GET'
      })
    }

  }

  googlePhotosHeaders({ token }) {
    return {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

}
