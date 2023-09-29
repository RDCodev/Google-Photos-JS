import GoogleServicePhoto from "../service/google_service.js"

export function backupGooglePhotos(backupPhotosOptions) {
  const { path, service } = backupPhotosOptions

  if (service !== 'Photos') return

  const googlePhotos = new GoogleServicePhoto(path)
  googlePhotos.backupGooglePhotos(null)
}