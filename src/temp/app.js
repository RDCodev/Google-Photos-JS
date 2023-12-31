

async function main() {

  const googleService = new GoogleService()
  const googlePhotos = new GooglePhotosService()

  googleService.loadCredentials(join(
    dirname(fileURLToPath(import.meta.url)), './auth/credentials.json'))

  try {

    let token = await googleService.requestCredentials(['https://www.googleapis.com/auth/photoslibrary'])
    let resImage = await googlePhotos.downloadImages(token)

    if (!resImage) {
      token = await googleService.refreshAuthToken(false)
      resImage = await googlePhotos.downloadImages(token)
    }

  } catch (error) {
    console.log(error)
  }
}

main()
