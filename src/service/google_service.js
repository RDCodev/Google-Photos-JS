import { GoogleAuthFlow } from "../auth/google_auth.js"
import { GoogleUtils } from "../utils/google.utils.js"

export class GoogleService {

  credentials = null

  constructor() { }
}

export default class GoogleServicePhoto extends GoogleService {

  googleMediaPhotos = null
  googlePhoto = null

  constructor(path){
    super() 
    this.path = path
    this.googleAuth = new GoogleAuthFlow()
    this.googleUtils = new GoogleUtils()
  }

  backupGooglePhotos(){
    this.credentials = this.googleAuth.requestAuthClient({pathFile: this.path, isSave: true})
  }

  requestGooglePhotosMedia(){
    
  }

  requestGoogleImage(){

  }
}
