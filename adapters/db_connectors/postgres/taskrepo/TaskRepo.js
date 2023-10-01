import {v4 as uuid} from 'uuid';
export default class TaskRepo {
    #db;

    constructor(db) {
        this.#db = db;
    }

    async #prepareTaskLogUpdateQuery(newValues, oldValues) {

        let psql = 'INSERT INTO "infeedtaskman"."task_log" (id, task_id, action_user, date_logged, field_updated, old_field_value, new_field_value) ';
        let psqlParams = [];
        if(oldValues.status && newValues.status && (oldValues.status != newValues.status)) {
            psql += ` VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
            psqlParams = [uuid(), oldValues.id, oldValues.owned_by, newValues.modified_date, 'status', oldValues.status, newValues.status];
            return {query: psql, params: psqlParams};
        } 
        return null;
    }

    async #prepareTaskUpdateQuery(context) {

        let psqlParams = [];
        let psql = 'UPDATE "infeedtaskman"."task" SET ';

        let iter = 1
        for(const prop in context) {
            if (prop != "taskId" && context[prop]) {
                psql += `${prop} = $${iter},`
                psqlParams.push(context[prop]);
                iter++;
            }
        }

        //remove the last comma
        psql = psql.substring(0, psql.length-1);

        psql += ` WHERE id = $${iter}`
        psqlParams.push(context.taskId);

        return {query: psql, params: psqlParams};

    }

    async createNewTask(taskObject) {
        return new Promise(async(resolve, reject) => {
            try {
                const res = await this.#db.query('INSERT INTO "infeedtaskman"."task" (id, created_date, modified_date, description, status, created_by, owned_by, title) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
                [
                 taskObject.taskId, 
                 taskObject.created_date,
                 taskObject.modified_date,
                 taskObject.description,
                 taskObject.status,
                 taskObject.created_by,
                 taskObject.owned_by,
                 taskObject.title 
                ])
                if(res.rows && res.rows[0].id) {
                    resolve(res.rows[0]);
                    return;
                }
                reject(res);
            } catch (err) {
                console.log("Error occurred while creating a new file: "+err);
                reject(err);
                //return;
            }
        }).then(data => {
            return {success:1, data:data}
        }).catch(err => {
            return {success:0, err:err}
        })
    }

    async updateTask(context) {
        return new Promise(async(resolve, reject) => {
            try {

                /*
                  Fetch the task first then, prepare the data for logs, update the task, then update logs
                 */

                const fetchTask = await this.#db.query('SELECT * FROM "infeedtaskman"."task" WHERE id=$1',[context.taskId]);
                
                if(!fetchTask || !fetchTask.rows[0]) {
                    reject("No task details found for the task!");
                    return;
                }

                const taskOldValues = fetchTask.rows[0];

                const updateQueryAndParams = await this.#prepareTaskUpdateQuery(context);
                const res =  await this.#db.query(updateQueryAndParams.query, updateQueryAndParams.params);


                const updateTaskLogQueryAndParams = await this.#prepareTaskLogUpdateQuery(context, taskOldValues);
                if(updateTaskLogQueryAndParams) {
                  this.#db.query(updateTaskLogQueryAndParams.query, updateTaskLogQueryAndParams.params);
                }

                if(res && res.rowCount) {
                    resolve(res);
                    return;
                }
                reject(res);                    
            } catch (err) {
                console.log("Error occurred while updating file! "+err)
                console.log("TaskObjectForupdate: "+context)
                reject(err);
            }
        }).then(data => {
            return {success:1, data:data}
        }).catch(err => {
            return {success:0, err:err}
        })
    }

    async getTaskContents(context) {
        return new Promise(async(resolve, reject) => {
            try {
                const res =  await this.#db.query('SELECT title, description, status FROM "infeedtaskman"."task" WHERE owned_by = $1 AND id = $2', [context.owned_by, context.id]);

                if(res && res.rows) {
                    resolve(res.rows[0]);
                    return;
                }
                reject(res);                    
            } catch (err) {
                console.log("Error occurred while updating file! "+err)
                console.log("Task Object: "+context)
                reject(err);
            }
        }).then(data => {
            return {success:1, data:data}
        }).catch(err => {
            return {success:0, err:err}
        })
    }

    async getTasks(context) {
        return new Promise(async(resolve, reject) => {
            try {
                const psql = `SELECT title, description, status, owned_by, created_date, modified_date FROM "infeedtaskman"."task" WHERE owned_by = $1 LIMIT $2 OFFSET $3`;
                const psqlParams = [context.owned_by, context.limit, context.offset]

                const taskRes = await this.#db.query(psql, psqlParams);

                if(taskRes && taskRes.rows) {
                    resolve(taskRes.rows);
                    return;
                }

                reject(taskRes);
            } catch (err) {
                console.log("Error while fetching tasks:" +err);
                reject(err);
            }
        }).then(data => {
            return {sucess:1, page:context.page, count:data.length, data:data}
        }).catch(err => {
            return {sucess:0, err:err}
        })
    }

    async getAnalyticsForMonth(month) {
        return new Promise(async(resolve, reject) => {
            try {
                const psql = `select distinct on (tl.task_id) tl.task_id, tl.id, tl.date_logged, tl.new_field_value from "infeedtaskman"."task_log" tl  where date_trunc('month', tl.date_logged) = $1  order by tl.task_id asc, tl.date_logged desc`;
                const monthComplete = `2023-${month}-01`;
                const psqlParam = [monthComplete];

                const monthData = await this.#db.query(psql,psqlParam);

                if(monthData && monthData.rows) {
                    resolve(monthData.rows);
                    return;
                }

                reject(monthData);
            } catch(err) {
                console.log("Error while fetching analytics! :"+err);
                reject(err);
            }
        }).then(data => {
            return {success:1, data:data};
        }).catch(err=> {
            return {success:0, err:err};
        });
    }

    async getAnalyticsForRangeOfPreviousMonths(minMonth, maxMonth) {
        return new Promise(async(resolve, reject) => {
            try {
                const psql = `select distinct on (tl.task_id) tl.task_id, tl.id, tl.date_logged, tl.new_field_value from "infeedtaskman"."task_log" tl  where date_trunc('month', tl.date_logged) >= $1 AND date_trunc('month', tl.date_logged) <= $2 order by tl.task_id asc, tl.date_logged desc`;
                const minMonthComplete = `2023-${minMonth+1}-01`;
                const maxMonthComplete = `2023-${maxMonth+1}-01`;
                const psqlParam = [minMonthComplete, maxMonthComplete];

                const rangeData = await this.#db.query(psql,psqlParam);

                if(rangeData && rangeData.rows) {
                    resolve(rangeData.rows);
                    return;
                }

                reject(rangeData);
            } catch(err) {
                console.log("Error while fetching analytics! :"+err);
                reject(err);
            }
        }).then(data => {
            return {success:1, data:data};
        }).catch(err=> {
            return {success:0, err:err};
        });
    }
}