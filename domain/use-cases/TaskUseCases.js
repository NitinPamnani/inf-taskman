import Task from "../entities/Task.js";
import {v4 as uuid} from 'uuid';
import * as db from '../../adapters/db_connectors/postgres/db.js'
import config from "../../config/config.js";


const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug","Sep", "Oct", "Nov", "Dec"]

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

async function getAnalyticsForMonth(month) {
    const monIndex = months.indexOf(month)+1;
    const getData = await db.taskRepo.getAnalyticsForMonth(monIndex);

    if(!getData.success) {
        return getData;
    }

    const data = getData.data;
    const res = {
        month: month,
        metrics: {
            open_tasks:0,
            in_progress_tasks:0,
            in_testing_tasks:0,
            deployed_tasks:0,
            completed_tasks:0
        }
    }

    for(const task of data) {
        if(task.new_field_value == "done") {
            res.metrics.completed_tasks++;
        } else if(task.new_field_value == "inprogress") {
            res.metrics.in_progress_tasks++;
        } else if(task.new_field_value == "testing") {
            res.metrics.in_testing_tasks++;
        } else if(task.new_field_value == "deployed") {
            res.metrics.deployed_tasks++;
        } else if(task.new_field_value == "tobedone") {
            res.metrics.open_tasks++;
        }
    }

    return res;
}

async function getAnalyticsForRangeOfPreviousMonths(range) {

}

export {
    createNewTask,
    updateTask,
    getTaskContents,
    getTasks,
    getAnalyticsForMonth,
    getAnalyticsForRangeOfPreviousMonths
}