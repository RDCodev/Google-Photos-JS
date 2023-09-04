import 'dotenv/config'
import { pinoConfig } from './config/pino.config.js'
import { urlAuthCodeRequest, googlePhotosAuthConfig } from './config/creds.config.js'
import { authTokenRequest } from './auth/token.request.js'
import http from 'http'
import https from 'https'
import logger from 'pino'
import open from 'open'
import fs from 'fs'

function main(){

  if(fs.existsSync('token.json')){
    
    let data = ""
    const token = JSON.parse(fs.readFileSync('./token.json'))
    const options = {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token.access_token}`
      }
    }

    const req = https.get('https://photoslibrary.googleapis.com/v1/mediaItems',options, (res) => {

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        const { mediaItems } = JSON.parse(data)    
        let image = []
        const reqImage = https.get(`${mediaItems[0].baseUrl}=d`, options, (res) => {
          res.on('data', chunk => {            
            image = [...image, chunk]
          })          

          res.on('end', () => {                      
            fs.writeFileSync(`${mediaItems[0].filename}`, Buffer.concat([...image]))
          })
        })


        reqImage.end()
      })

      res.on('error', err => {
        console.log(err)
      })
    })

    req.end()

    return
  }
  
  open(urlAuthCodeRequest, { app: 'google chrome' })
  
  const server = http.createServer((req, res) => { 
    res.end()
  })
  
  server.on('request', (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    let codeAuthorization = null  
  
    if(url.searchParams.has('code')){
      codeAuthorization = url.searchParams.get('code')      
      authTokenRequest(googlePhotosAuthConfig(codeAuthorization))    
    }  
  
    if(url.searchParams.has('error')){
      return
    }
  })
  
  server.on('listening', () => {
    console.log(`Listening on port ${process.env.PORT}`)
  })
  
  server.listen(process.env.PORT | 8080)
}

main()