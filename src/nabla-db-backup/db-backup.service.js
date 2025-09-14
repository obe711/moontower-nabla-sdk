const axios = require('axios');
const mongoose = require('mongoose');



class NablaDbBackup {
  constructor(options = {}) {
    this.uri = options?.uri || "mongodb://127.0.0.1:27017/nabla-db-backup";
    this.mongoOptions = {}
    this.baseURL = options?.baseURL || "http://localhost:4000/v1";
    this.basePort = options?.basePort || 4000;
    this.nablaApiKey = options?.nablaApiKey || "1234567890";
    this.userAgent = options?.userAgent || "Nabla-1.0.0";
    this.init();
  }

  init() {
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
  }


  createBackup() {

  }


  async connect() {
    try {
      this.conn = await mongoose.createConnection(this.uri, this.mongoOptions).asPromise();
    } catch (err) {
      // HANDLE ERROR
      //
      this.conn = null;
    }

  }

  useDb(database) {
    if (this.conn === null) return this.nablaError("No Mongo Connection");


    this.db = this.conn.useDb(database, { useCache: true });
  }

  get dbName() {
    if (this.conn === null) return this.nablaError("No Mongo Connection");

    return this.conn.name;
  }


  // 
  nablaError() { }
}