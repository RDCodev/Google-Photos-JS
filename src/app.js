import 'dotenv/config'
import { pinoConfig } from './config/pino.config.js'
import { GooglePhotosService, GoogleService } from './config/creds.config.js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

function main(){
  
  const googleService = new GoogleService()
  const googlePhotos = new GooglePhotosService()
  
  googleService.loadCredentials(join(
    dirname(fileURLToPath(import.meta.url)), './auth/credentials.json'))

  googleService.requestCredentials(['https://www.googleapis.com/auth/photoslibrary'])
  .then(
    token => googlePhotos.downloadImages(token)
  )

}

main()
