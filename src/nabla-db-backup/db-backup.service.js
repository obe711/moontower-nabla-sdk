const EventEmitter = require('node:events');
const axios = require('axios');
const mongoose = require('mongoose');
const { toJSON, paginate } = require('../db/plugins');




class NablaDbBackup extends EventEmitter {
  constructor(options = {}) {
    super()

    this.uri = options?.uri || "mongodb://127.0.0.1:27017/nabla-db-backup";
    this.mongoOptions = {}
    this.baseURL = options?.baseURL || "http://localhost:4000/v1";
    this.basePort = options?.basePort || 4000;
    this.nablaApiKey = options?.nablaApiKey || "1234567890";
    this.userAgent = options?.userAgent || "Nabla-1.0.0";

    mongoose.plugin(toJSON);
    mongoose.plugin(paginate);

    this.init();
  }

  init() {

    console.group("init")

    console.groupEnd()
    this.connect().then(() => {

      if (this.conn == null) {
        console.error("conn is null")
        console.groupEnd();
        return this.nablaError("connect failed")
      }

      this.axios = axios.create({
        withCredentials: true,
        baseURL: !!this.baseURL ? this.baseURL : `http://localhost:${this.basePort}/v1`,
        headers: {
          common: {
            'x-nabla': this.nablaApiKey,
            "User-Agent": this.userAgent
          }
        }
      });

      console.log("axios complete")
      console.groupEnd();
      console.log("this", this.dbName)
      return this;
    }).catch((err) => {
      return this.nablaError(err)
    })
  }


  // const backup = await nablaDbBackupService.createDbBackup({
  //   db: dbStats.db,
  //   user: req.user.id,
  //   ip: req.clientIP,
  //   userCount,
  //   dbSize: dbStats.dataSize,
  //   recordCount: dbStats.objects,
  //   collectionCount: dbStats.collections
  // });

  createBackup = async (dbName) => {
    try {
      console.warn("createBackup", dbName, this)


      // const db = this.useDb(dbName)
      // console.log("db", db, this.conn);

      // console.log("conn", this)

      // await this.conn.close();
      // this.conn = db;



    } catch (err) {
      return this.nablaError(err)
    }
  }

  // api
  sendBackupRequest = async () => {
    try {
      return this.axios.post("/backups", {
        db: this.stats.db,
        // user: new mongoose.Types.ObjectId(),
        ip: "127.0.0.1",
        userCount: this.userCount,
        dbSize: this.stats.dataSize,
        recordCount: this.stats.objects,
        collectionCount: this.stats.collections
      })
    } catch (err) {
      return this.nablaError(err)
    }

  }


  // only set db here
  useDb(database) {
    if (this.conn === null) return this.nablaError("No Mongo Connection");


    return this.conn.useDb(database, { useCache: true });
  }


  // init and get data
  getDatabases = async () => {
    if (this.conn === null) return this.nablaError("No Mongo Connection");
    try {
      this.mongoInfo = await this.conn.listDatabases();

      this.databases = [...this.mongoInfo.databases.filter((db) => (
        db.name !== "admin" && db.name !== "config" && db.name !== "local"
      ))].map(db => db.name);

      this.stats = await this.conn.db.stats();
      this.collections = await this.conn.listCollections();
      this.userCount = 0;
      const found = this.collections.find(c => c.name === "users");
      if (!!found) {
        const Users = this.conn.collection("users");
        this.userCount = await Users.estimatedDocumentCount()
      }
      console.warn("No user DB found")
      return this;
    } catch (err) {
      return this.nablaError(err)
    }
  }


  async connect() {
    try {
      this.conn = await mongoose.createConnection(this.uri, this.mongoOptions).asPromise();
      if (this.conn === null) return this.nablaError("No Mongo Connection");
      await this.getDatabases();

    } catch (err) {


      this.conn = null;
      // HANDLE ERROR
      return this.nablaError(err);
    }
  }


  get dbName() {
    if (this.conn === null) return this.nablaError("No Mongo Connection");
    return this.conn.name;
  }

  // 
  nablaError = (err) => {
    if (typeof err === "string")
      console.warn("nablaError string", err);

    if (err instanceof Error) {
      console.warn("instanceof Error", err.message)
      this.emit("nabla-error", err);
      // process.exit(1);
    }
    return this
  }
}

module.exports = NablaDbBackup;