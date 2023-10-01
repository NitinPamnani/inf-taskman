export default class UserRepo {
    #db;

    constructor(db) {
        this.#db = db;
    }

    async getUserDetails(query) {
        return new Promise(async(resolve, reject) => {
            try{
                const res = await this.#db.query('SELECT * FROM "infeedtaskman"."users" WHERE email = $1', [query.email]);
                if(res.rows) {
                    resolve(res.rows[0]);
                    return;
                }
                reject(res);
            } catch(err) {
                console.log("Error while fetching user details: "+err);
                reject(err);
            }
        }).then(data => {
            return {success:1, data: data};
        }).catch(err => {
            return {success:0, err: err};
        })
    }
}