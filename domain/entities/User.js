export default class User {
    #id;
    #name;
    #created_at;
    #modified_at;
    #status;
    #email;
    #username;
    #digested_pass;

    constructor(id, name, created_at, modified_at, status, email, username, digested_pass) {
        this.#id = id;
        this.#name = name;
        this.#created_at = created_at;
        this.#status = status;
        this.#email = email;
        this.#username = username;
        this.#modified_at = modified_at;
        this.#digested_pass = digested_pass;
    }

    getName() {
        return this.#name;
    }

    setName(name) {
        this.#name = name;
        this.#modified_at = new Date();
    }

    getUserName() {
        return this.#username;
    }

    getDigestedPass() {
        return this.#digested_pass;
    }

    setDigestedPass(digested_pass) {
        this.#digested_pass = digested_pass;
        this.#modified_at = new Date();
    }

    getStatus() {
        return this.#status;
    }

    setStatus(status) {
        this.#status = status;
        this.#modified_at = new Date();
    } 

    getUserDetails() {
        return {
            name : this.#name,
            email : this.#email,
            username : this.#username,
            created_at : this.#created_at,
            digested_pass : this.#digested_pass
        }
    }
}