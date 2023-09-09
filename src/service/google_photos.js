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

  downloadNextPageImages(){
    
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
  
        res.on('data', chunk => {
          data += chunk
        })
  
        res.on('end', () => {
  
          data = JSON.parse(data)
  
          if (data.hasOwnProperty('error')) {                       
            resolve(false)
          }

          if(data.hasOwnProperty('mediaItems')){

            while(true){
              const { mediaItems } = data

              if(!mediaItems.hasOwnProperty('nextPageToken')){
                break
              }

              mediaItems.forEach((media, i) => {
                this.requestGoogleImage(media, options)
                  .then(
                    res => {
                      if (res)
                        console.log(`Image ${i} saved.`)
                        resolve(true)
                    }
                  ).catch(err => reject(err))
              })

              const req = https.get(`https://photoslibrary.googleapis.com/v1/mediaItems?pageToken=${mediaItems.nextPageToken}`, options, (res) => {
                res.on('data', chunk => {})
              })

              req.end()
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