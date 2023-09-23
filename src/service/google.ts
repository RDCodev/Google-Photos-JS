import fs from "fs";
import { RequestGoogle } from "../utils/request.utils";

interface Credentials {
  token: string;
  auth2Code: string;
}

type OAuthClient = OAtuhClientInstalled;

interface OAtuhClientInstalled {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_sercret: string;
  redirect_uris: string[];
}

const URI_TOKEN_FILE = "./token.json";

export class GoogleService {
  private credentials: Credentials | null = null;
  private OAuthClient: OAuthClient;

  constructor(
    private requestGoogle: RequestGoogle
  ) {}

  private loadCredentials(pathFile: fs.PathOrFileDescriptor) {
    try {
      const file = fs.readFileSync(pathFile).toJSON();
    } catch (error) {
      throw error;
    }
  }

  private requestCredentials(scopes: string[]) {
    try {
      if (fs.existsSync("token.json"))
        return fs.readFileSync(URI_TOKEN_FILE).toJSON();

      return this.requestAuthToken();
    } catch (error) {
      throw error;
    }
  }

  private refreshAuthToken() {
    
  }

  private requestAuthToken() {
    
  }
}
