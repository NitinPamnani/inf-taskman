import Task from "../entities/Task.js";
import {v4 as uuid} from 'uuid';
import * as db from '../../adapters/db_connectors/postgres/db.js'



async function createNewTask(context) {

    let currDate = new Date();
    let id = uuid();
    let newTask = new Task(id, context.title, context.description, currDate, currDate, context.ownerId, context.creatorId);
    const taskDetails = newTask.getTaskDetails()
    const res =  await db.taskRepo.createNewTask(taskDetails);  
    return res;
}

async function updateTask(context) {
    
    const res = await db.taskRepo.updateTask(context);
    return res;
}

async function getTaskContents(context) {

        const query = {fileId: context.fileId, owner_id: context.ownerId}

        const fileData = await db.taskRepo.getTaskContents(query);
        return fileData
}

export {
    createNewTask,
    updateTask,
    getTaskContents
}