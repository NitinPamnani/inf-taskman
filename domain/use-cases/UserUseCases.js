import User from "../entities/User.js";
import {v4 as uuid} from 'uuid';
import * as db from '../../adapters/db_connectors/postgres/db.js';
import { createHash } from 'crypto';


async function createNewUser() {

}

async function getUserDetails(context) {

}

async function updateUserDetails(context) {

}

async function fetchUserQuery(context) {
    let fetchUserQuery = '';
    if(context.username) {
        fetchUserQuery = {
            username: context.username
        }
    } else if (context.email) {
        fetchUserQuery = {
            email: context.email
        }
    }

    return fetchUserQuery;
}

async function comparePassword(context, userDetails) {

    const key = "2kqvjYKWmJ";
    const salt = "nP2nWfhb9V";

    const digestedPass = userDetails.digested_pass;
    let inputDigest = createHash("sha512").update(key+'|'+context.password+'|'+salt).digest("hex");

    return inputDigest == digestedPass;
}

async function validateUserPassword(context) {
    return new Promise(async(resolve, reject) => {
        try {
            const query = await fetchUserQuery(context);
            const userDetails = await db.userRepo.getUserDetails(query);
            if(userDetails.success) {
                const passRes = await comparePassword(context, userDetails.data);
                if(passRes) {
                    resolve({success:1, data: userDetails.data});
                    return;
                }
                reject({success:0})
            } else {
                //return {success: 0, err: "User details not found!"}
                reject({success:0, err: "User details not found!"});
            }
        } catch (err) {
            console.log("Err while validating user: "+err)
            reject({sucess:0, err:"Err while validating user: "+err})
        }
    }).then(data => {
        return data;
    }).catch(err => {
        return err;
    })
}

export {
    createNewUser,
    getUserDetails,
    updateUserDetails,
    validateUserPassword
}