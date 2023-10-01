export default class Task {
    #id;
    #title;
    #description;
    #created_date;
    #modified_date;
    #owned_by;
    #created_by;
    #status

    constructor(id, title, description, created_date, modified_date, owned_by, created_by, status) {
        this.#id = id;
        this.#title = title;
        this.#created_date = created_date;
        this.#modified_date = modified_date;
        this.#description = description;
        this.#owned_by = owned_by;
        this.#created_by = created_by;
        this.#status = status ? status : 'tobedone';
    }

    getId() {
        return this.#id;
    }

    setTitle(title) {
        this.#title = title;
        this.#modified_date = new Date();
    }

    getTitle() {
        return this.#title;
    }

    setOwner(owned_by) {
        this.#owned_by = owned_by;
        this.#modified_date = new Date();
    }

    getOwner() {
        return this.#owned_by;
    }    

    setCreatorId(created_by_id) {
        this.#created_by = created_by_id;
        this.#modified_date = new Date();
    }

    getCreatorId() {
        return this.#created_by;
    }

    setDescription(description) {
        this.#description = description;
        this.#modified_date = new Date();
    }

    getDescription() {
        return this.#description;
    }

    getStatus(){
        return this.#status;
    }

    setStatus(status) {
        this.#status = status;
        this.#modified_date= new Date();
    }

    getTaskDetails() {
        return {
            taskId : this.#id,
            title : this.#title,
            description : this.#description,
            created_date : this.#created_date,
            modified_date : this.#modified_date,
            owned_by : this.#owned_by,
            created_by : this.#created_by,
            status: this.#status
        }
    }

}