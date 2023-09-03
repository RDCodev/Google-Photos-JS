import https from 'https'
import fs from 'fs'

export function authTokenRequest(config){

  let token = null

  const req = https.request(config, (res) => {            

    res.on('data', chunk => {
      token = JSON.stringify(JSON.parse(chunk))      
      fs.writeFileSync('./token.json', token, 'utf-8')
    })

    res.on('error', (err) => {
      console.log(err)
    })

  })

  req.end()
}