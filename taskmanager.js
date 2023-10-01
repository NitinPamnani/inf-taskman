import express from 'express';
import * as db from './adapters/db_connectors/postgres/db.js'
import Config from './config/config.js'
import taskRouter from './adapters/REST/TaskRoutes.js';
import userRouter from './adapters/REST/UserRoutes.js';


const app = express();

const PORT = Config.application.port ||  5001;


app.use(express.json())
app.use('/api/v1/task', taskRouter)
app.use('/api/v1/user', userRouter)

db.run().then(()=>{
  app.listen(PORT, () => {
      console.log("REST serving at "+PORT)
  })
}).catch((err)=> {
    console.log("Check this error"+err)
})