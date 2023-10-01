import express from 'express';
import * as userUseCases from '../../domain/use-cases/UserUseCases.js';
const userRouter = express.Router();
import jwt from 'jsonwebtoken';
import Config from '../../config/config.js'
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

        
//public and private key
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const privateKey = fs.readFileSync(path.resolve(__dirname,'../../config/private.key'),'utf-8');
const publicKey = fs.readFileSync(path.resolve(__dirname,'../../config/public.key'),'utf-8');

userRouter.post('/token', async(req, res) => {
    //validate the user exits and check if pass is valid
    const password = req.body.password;
    const email = req.body.email;
    const context = {
        password: password,
        email: email
    }
    const validUserRes = await userUseCases.validateUserPassword(context);
    if(validUserRes.success) {
        const userData = validUserRes.data;

        //signing options
        const signOptions = Config.jwtSigningOptions;

        const jwtData = {
            userId: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            name: userData.name
        }
        try {
          const token = jwt.sign(jwtData, privateKey, signOptions);
          if(token) {
            res.send({success:1, token: token});
          } else {
            res.send({success:0})
          }
        } catch(err) {
            console.log("Unable to create JWT: "+err)
            res.send({success:0})
        }
    } else {
        res.send({success:0, message:"Invalid User!"});
    }

})

export default userRouter;