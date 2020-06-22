import * as fs from 'fs'

function readFile(filename: string) {
  try {
    return fs.readFileSync(filename).toString('utf8')
  } catch (e) {
    return undefined
  }
}

export default {
  BASE_URL: process.env.BASE_URL || readFile('environment_url.txt') || 'http://localhost:3000'
}
