import { GoogleAuthFlow } from "../auth/google_auth.js"

export class GoogleService {

  credentials = null

  constructor() { }
}

export default class GoogleServicePhoto extends GoogleService {
  constructor(path){
    super() 
    this.path = path
    this.googleAuth = new GoogleAuthFlow()
  }

  backupGooglePhotos(){
    this.googleAuth.requestAuthClient({pathFile: this.path, isSave: true})
  }
}
