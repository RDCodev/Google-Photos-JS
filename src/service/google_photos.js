import 'dotenv/config'
import fs from 'fs'
import https from 'https'

export class GooglePhotosService {

  constructor() { }

  requestGoogleImage(media, options) {

    return new Promise((resolve, reject) => {

      let image = []

      const reqImage = https.get(`${media.baseUrl}=d`, options, (res) => {
        res.on('data', chunk => {
          image = [...image, chunk]
        })

        res.on('error', err => {
          console.log(err)
          reject(err)
        })

        res.on('end', () => {
          resolve(true)
          fs.writeFileSync(`./downloads/${media.filename}`, Buffer.concat([...image]))
        })
      })

      reqImage.end()
    })

  }

  downloadNextPageImages(nextPageToken, options) {
    return new Promise((resolve, reject) => {
      const req = https.get(
        `https://photoslibrary.googleapis.com/v1/mediaItems?pageToken=${nextPageToken}`,
        options, (res) => {
          let temp = ""

          res.on('data', chunk => {
            temp += chunk
          })

          res.on('end', () => {

            if (temp) {
              resolve(JSON.parse(temp))
            }
          })

          res.on('error', (err) => reject(err))
        })

      req.end()
    })
  }

  downloadImages(tokenAuth) {

    const token = tokenAuth

    const options = {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token.access_token}`
      }
    }

    return new Promise((resolve, reject) => {

      const req = https.get('https://photoslibrary.googleapis.com/v1/mediaItems', options, (res) => {

        let data = ""
        let cont = 0

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', async () => {

          data = JSON.parse(data)

          if (data.hasOwnProperty('error')) {
            resolve(false)
          }

          if (data.hasOwnProperty('mediaItems')) {

            let { mediaItems, nextPageToken } = data

            while (nextPageToken) {

              console.log(nextPageToken)

              mediaItems.forEach(async (media, i) => {

                if (media.mimeType == 'image/jpeg') {

                  try {
                    const res = await this.requestGoogleImage(media, options)

                    if (res) {
                      console.log(`Image ${i} saved.`)
                      resolve(true)
                    }

                  } catch (error) {
                    reject(error)
                  }

                }

              })

              const res = await this.downloadNextPageImages(nextPageToken, options)

              mediaItems = res.mediaItems
              nextPageToken = res.nextPageToken

            }


          }

        })


        res.on('error', err => {
          reject(err)
        })
      })

      req.end()
    })

  }

}