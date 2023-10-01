import Task from "../entities/Task.js";
import {v4 as uuid} from 'uuid';
import * as db from '../../adapters/db_connectors/postgres/db.js'
import config from "../../config/config.js";



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
     
    const taskData = await db.taskRepo.getTaskContents(context);
    return taskData;
}

async function getTasks(context) {
    const pageSize = config.tasks.pageSize;
    const offset = (context.page - 1) * pageSize;
    context["limit"] = pageSize;
    context["offset"] = offset;

    return await db.taskRepo.getTasks(context);
}

export {
    createNewTask,
    updateTask,
    getTaskContents,
    getTasks
}