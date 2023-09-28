import http from 'http'
import https from 'https'
import open from 'open'
import fs from 'fs'
import { resolve } from 'path';
import url from 'url'

export class GoogleUtils {

  server = null
  client = null

  constructor() {
    this.server = http.createServer((_, res) => res.end() )
    this.server.listen(8080)
  }

  googleServerRequest({ urlOptions, app = 'google chrome' }) {
    
    open(urlOptions, { app })

    return new Promise((resolve, reject) => {
      this.server.on('request', (req) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
  
        if (url.searchParams.has('code')){
          resolve(url.searchParams.get('code'))
        }
        
        this.server.close()
        reject(null)
      })  
    })    
  }

  googleClientRequest({ urlOptions }) {

    let buffer = ""

    return new Promise((resolve, reject) => {
      https.request(urlOptions, (res) => {
        res.on('data', chunk => buffer += chunk)
        res.on('end', () => resolve(buffer))
        res.on('error', err => reject(err))
      }).end()      
    })
  }

  googleSaveFile({ path, filename, data }) {
    try {
      fs.writeFileSync(`${process.cwd()}${path}/${filename}`, JSON.stringify(data), 'utf-8')
    } catch (error) {
      throw error
    }
  }

  googleReadFile({ path }) {
    try {      
      return JSON.parse(fs.readFileSync(this.googleParsePathFile(path)))
    } catch (error) {
      throw error
    }
  }

  googleParsePathFile(path){
    return resolve(path)
  }

  googleUrlOptions({ credentialOptions, queryOptions, headerOptions, isOptions, method = 'POST' }) {
    const uri = new URL(url.format({
      protocol: credentialOptions.protocol,
      host: credentialOptions.hostname,
      pathname: credentialOptions.pathname,
      query: queryOptions
    }))

    const options = {
      method,
      hostname: uri.host,
      path: uri.pathname + uri.search,
      headers: headerOptions
    }

    return !isOptions ? uri.toString() : options
  }

  googleCheckFile({path}){
    if(fs.existsSync(`${process.cwd()}${path}`)){
      return this.googleReadFile({ path: `${process.cwd()}${path}`})
    }
    
    return false
  }
}