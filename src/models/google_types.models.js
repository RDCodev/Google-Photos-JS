export const GOOGLE_AUTH_TYPES = {
  installed: "installed"
}

export const GOOGLE_QUERY_OAUTH = {
  scope: [],
  access_type: 'offline',
  include_granted_scopes: 'true',
  response_type: 'code',
  redirect_uri: null,
  client_id: null
}

export const GOOGLE_QUERY_TOKEN = {
  code: null,
  client_id: null,
  client_secret: null,
  redirect_uri: [],
  grant_type: 'authorization_code'
}

export const GOOGLE_QUERY_REFRESH_TOKEN = {
  client_id: null,
  client_secret: null,
  refresh_token: null,
  grant_type: 'refresh_token'
}

export const GOOGLE_PHOTOS_SCOPES = {
  full_access: "https://www.googleapis.com/auth/photoslibrary",
  read_only: "https://www.googleapis.com/auth/photoslibrary.readonly"
}