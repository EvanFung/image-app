import { createServer, startServer } from './server'
import * as AWS from 'aws-sdk'



createServer()
    .then(startServer)
    .catch((err) => {
        console.log(err)
    })