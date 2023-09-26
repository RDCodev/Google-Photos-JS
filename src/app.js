import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { backupGooglePhotos } from './cli/functions.cli.js'

yargs(hideBin(process.argv))
  .command(
    "backup",
    "Backup the data in Google Accounts",
    () => { },
    (argv) => {
      backupGooglePhotos(argv)
    }
  )
  .example('node $0 backup --service=Photos --path="~/home')
  .parse()