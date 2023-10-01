import jwt from "jsonwebtoken";
import path, {dirname} from 'path';
import { fileURLToPath  } from 'url';
import fs from 'fs'
//public and private key
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const privateKey = fs.readFileSync(path.resolve(__dirname,'../../config/private.key'),'utf-8');

async function validateJWT(token) {
    try {
        const decode =  jwt.verify(token, privateKey);
        return {success:1, data:decode}
      } catch (err) {
          console.log("Invalid JWT:"+err.message);
          return {success:0, err:"Invalid JWT!"}
      }  
} 

export {
    validateJWT
}