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

async function validateTimeframeParamForAnalytics(param) {

    const supportedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug","Sep", "Oct", "Nov", "Dec"]

    if(isNaN(param)) {
        const isParamSupported = supportedMonths.includes(param);
        if(!isParamSupported) {
            return {succes:0, err:"For a specific month's data. Supported months are: "+supportedMonths.join(", ")};
        }

        return {success:1 , action:"MONTH"}

    } else {
        
        if(!Number.isInteger(parseInt(param))) {
            return {success:0, err:"If you want previous months data as a timeline, please pass the number of months as an integer between 1-12."};
        }

        if(parseInt(param) > 12) {
            return {success: 0, err:"Only past 12 months analytics is supported!"}
        }

        return {success:1, action:"RANGE"}
    }
}

export {
    valAndPrepUpdateTaskContext,
    validateTimeframeParamForAnalytics
}