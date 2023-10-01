import pg from 'pg';
import Config from '../../../config/config.js';
import TaskRepo from './taskrepo/TaskRepo.js';
import UserRepo from './userrepo/UserRepo.js';

const PGPool = pg.Pool;

let userRepo;
let taskRepo;

async function run() {
    try {
      const connPool = new PGPool({
        user: Config.database.user,
        host: Config.database.host,
        database: Config.database.database,
        password: Config.database.password,
        port: Config.database.port
      })
      taskRepo = new TaskRepo(connPool);
      userRepo = new UserRepo(connPool);
    } catch (err) {
      console.log(err)
    }
}

export  {
  run,
  userRepo,
  taskRepo
}