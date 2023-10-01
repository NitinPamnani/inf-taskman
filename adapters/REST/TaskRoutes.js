import express from 'express';
import * as taskUseCases from '../../domain/use-cases/TaskUseCases.js'
import * as authUseCases from '../../domain/use-cases/AuthenticationUseCases.js';
import * as validationUseCases from '../../domain/use-cases/ValidationUseCases.js';
const taskRouter = express.Router();


taskRouter.post('/', async(req, res) => {

    const {token, title, description} = req.body;
    const tokenPayload = await authUseCases.validateJWT(token);

    if(tokenPayload.success) {
        const userData = tokenPayload.data;
        const userId = userData.userId;
        const context = {
            title: title,
            ownerId: userId,
            creatorId: userId,            
            description:description
        }

        const resp = await taskUseCases.createNewTask(context);

        if(resp.success) {
            res.send({success:1, data:resp.data})
        } else {
            res.send({success:0, err:"Unable to create a new task:"+resp.err})
        }
        
    } else {
        res.send({success:0, err:tokenPayload.err});
    } 
})

taskRouter.put('/', async(req, res) => {


    const taskId = req.body.taskId;
    const title = req.body.title ? req.body.title : null;
    const description = req.body.description ? req.body.description : null;

    const status = req.body.status ? req.body.status : null;
    const token = req.body.token ? req.body.token : null;

    const tokenPayload = await authUseCases.validateJWT(token);
    
    if(!tokenPayload.success) {
        res.send({success:0, err:tokenPayload.err});
    }

    const userData = tokenPayload.data;
    const userId = userData.userId;

    const expContext = {
        taskId: taskId,
        title: title,
        description: description,
        status: status,
        owned_by: userId
    }

    const contextData = await validationUseCases.valAndPrepUpdateTaskContext(expContext);

    if(!contextData.success) {
        res.send(contextData);
        return;
    }

    const context = contextData.data;
    let updateTaskRes = await taskUseCases.updateTask(context);
    console.log("Check the logs" + JSON.stringify(updateTaskRes));

    if(updateTaskRes.success) {
        res.send({sucess:true, message:"Task updated successfully!"});
    } else {
        res.send({success:false, message:"Unable to update task!"});
    }
})

taskRouter.get('/s', async(req, res) => {
    const page = req.body.page;
    const token = req.body.token ? req.body.token : null;

    const tokenPayload = await authUseCases.validateJWT(token);
    
    if(!tokenPayload.success) {
        res.send({success:0, err:tokenPayload.err});
    }

    const userData = tokenPayload.data;
    const userId = userData.userId;
    const context = {
        owned_by: userId,
        page:page
    }

    const tasksData = await taskUseCases.getTasks(context);
    res.send(tasksData);
})

taskRouter.get('/s/:id', async(req, res) => {
    const taskId = req.params.id;
    const token = req.body.token ? req.body.token : null;

    const tokenPayload = await authUseCases.validateJWT(token);
    
    if(!tokenPayload.success) {
        res.send({success:0, err:tokenPayload.err});
    }

    const userData = tokenPayload.data;
    const userId = userData.userId;
    const context = {
        owned_by: userId,
        id:taskId
    }

    const taskData = await taskUseCases.getTaskContents(context);
    res.send(taskData);
})

taskRouter.get('/analytics/:timeframe', async(req,res) => {

    const timeParam = req.params.timeframe;

    const validateTimeParam = await validationUseCases.validateTimeframeParamForAnalytics(timeParam);
    if(!validateTimeParam.success) {
        res.send(validateTimeParam);
        return;
    }
    
    const action = validateTimeParam.action;

    if(action == "MONTH") {
         res.send(await taskUseCases.getAnalyticsForMonth(timeParam));
    }else if (action == "RANGE") {
        res.send(await taskUseCases.getAnalyticsForRangeOfPreviousMonths(timeParam));
    } else {
        res.send({success:0, err:"Action failure!"});
    }
})

export default taskRouter
