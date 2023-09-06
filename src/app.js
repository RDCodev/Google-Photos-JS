import 'dotenv/config'
import { pinoConfig } from './config/pino.config.js'
import { urlAuthCodeRequest, googlePhotosAuthConfig } from './config/creds.config.js'
import { authTokenRequest } from './auth/token.request.js'
import http from 'http'

import logger from 'pino'
import open from 'open'
import fs from 'fs'

function main(){

  if(fs.existsSync('token.json')){

    

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