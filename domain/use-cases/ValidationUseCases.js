import { validate as isValidId } from "uuid"

async function valAndPrepUpdateTaskContext(data) {

    if(!data) {
        return {success:0, err:`No data found for udpate`};
    }

    if(!data.taskId || !isValidId(data.taskId)) {
        return {success:0, err:`Task Id provided is not valid`};
    }

    let res = {};

    const supportedTaskStatuses = ['tobedone', 'inprogress', 'testing', 'deployed', 'done'];
    const supportedTaskStatusesSet = new Set(supportedTaskStatuses);

    const propertiesSupported = ['taskId', 'title', 'description', 'status', 'owned_by']
    const propertiesSupportedSet = new Set(propertiesSupported);

    for (const property in data) {

        //check if property is supported for update
        if(!propertiesSupportedSet.has(property)) {
            return {success:0, err:`Forbidden update! Property ${property} cannot be updated`};
        }

        if(property == "owned_by" && !isValidId(data[property])) {
            return {success:0, err:`Owner Id is not valid. Update Aborted!`};
        }

        if(property == "status" && data[property] &&  !supportedTaskStatusesSet.has(data[property])) {
            return {success:0, err:`Unsupported task status provided.`}
        }

        res[property] = data[property];
    }    

    if(Object.keys(res).length <=1 ) {
        return {success:0, err: `No data found for udpate`};
    }

    res["modified_date"] = new Date();

    return {success:1, data:res};
}

export {
    valAndPrepUpdateTaskContext
}