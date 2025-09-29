const axios = require('axios');
const pick = require("../utils/pick")
const { version } = require("../../package.json")
const constants = require("./constants")

class NablaDbBackup {
  constructor(options = {}) {
    this.userAgent = `Nabla-SDK-${version}`;
    this.setOptions(options);
    this.DAYS = constants.day;
    this.HOURS = constants.hour;
    this.INTERVALS = constants.interval;
    return this
  }

  /**************************************************
   * OPTIONS
   * ************************************************/

  /**
   * Set nabla-db-backup options
   * 
   * @param {Object} options 
   * - port {Number} - Port for nabla-db-backup server
   * - apiKey {String} - Api Key for nabla-db-backup server
   * @returns {this}
   */
  setOptions(options = {}) {
    if (options?.port) {
      this.setPort(options.port);
    }

    if (options?.apiKey) {
      this.setApiKey(options.apiKey)
    }

    this._createClient();
    return this
  }

  /**
   * Set nabla-db-backup server port
   * 
   * @param {Number} port - Port for nabla-db-backup server
   * @returns {this}
   */
  setPort(port) {
    this.port = port;
    this._createClient();
    return this
  }

  /**
   * Set nabla-db-backup server Api Key
   * 
   * @param {String} apiKey - Api Key for nabla-db-backup server
   * @returns {this}
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this._createClient();
    return this
  }

  /**************************************************
   * SDK
   * ************************************************/

  /**
   * List all databases
   * 
   * @returns {Promise<Array>}
   */
  async getDatabases() {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      const res = await this.http.get("/dbs");
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Get database data by db name
   * 
   * @returns {Promise<Object>}
   */
  async getDatabase(dbName) {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      const res = await this.http.get(`/dbs/${dbName}`);
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // backups
  /**
   * Query stored backups
   * 
   * @param {Object} filter
   * - startDate {Date} - on or after date
   * - endDate {Date} - on or before date
   * - db {String} - Database name
   * 
   * @param {Object} options (optional)
   * - page {Number}
   * - limit {Number}
   * - sortBy {String}
   * 
   * @returns {Promise<Object>}
   * - results {Array<Objects>}
   * - page {Number}
   * - limit {Number}
   * - totalPages {Number}
   * - totalResults {Number}
   */
  async queryBackups(filter, options = {}) {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      const qFilter = pick(filter, ["startDate", "endDate", "db"]);
      const qOptions = pick(options, ["limit", "page", "sortBy"]);

      const queryString = new URLSearchParams({ ...qFilter, ...qOptions }).toString();

      const res = await this.http.get(`/backups?${queryString}`);
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * @brief Get Download link for backup
   * 
   * @param {ObjectId} backupId 
   * 
   * @returns {Promise<Object>} 
   * - link {String} - URL for download
   * - file {String} - file name
   */
  async getBackup(backupId) {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      if (!backupId) {
        console.error("Backup ID required");
        return null;
      }

      const res = await this.http.get(`/backups/${backupId}`);
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * @brief Delete a backup
   * 
   * @param {ObjectId} backupId 
   * @return {<>}
   */
  async deleteBackup(backupId) {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      if (!backupId) {
        console.error("Backup ID required");
        return null;
      }

      const res = await this.http.delete(`/backups/${backupId}`);
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }



  /**
   * Create a backup of a database
   * 
   * @param {String} db - name of database to backup 
   * 
   * @returns {Promise<Object>} - Database backup record 
   */
  async createBackup(db) {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      if (!db) {
        console.error("Database name required");
        return null;
      }
      const res = await this.http.post(`/backups`, { db });
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }


  /**
   * Get all Automated Backups
   * 
   * @returns {Promise<Array<Object>>}
   */
  async getAutomatedBackups() {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      const res = await this.http.get(`/schedule`);
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Create/Update Automated Backup
   * 
   * @param {String} db - database name
   * @param {String} interval - backup frequency
   * - 'day' = ran daily
   * - 'week' = ran once a week
   * - 'month' = ran every 30 days
   * @param {Number} day - Day of the week. [0..6] = [Sun..Sat]
   * @param {Number} hour - Hour of the day. [0..23] = [12AM..11PM]
   * 
   * @returns {Promise<Object>}
   */
  async createAutomatedBackup(db, interval, day, hour) {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      const res = await this.http.post(`/schedule`, {
        db, interval, hour, day
      });

      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Remove an Automated Backup
   * 
   * @param {String} db - database name
   * 
   * @returns {Promise<Object>}
   */
  async removeAutomatedBackup(db) {
    if (!this._readyCheck()) {
      throw new Error(this.error);
    }
    try {
      const res = await this.http.delete(`/schedule/${db}`);
      return res?.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**************************************************
   * PRIVATE
   * ************************************************/

  _readyCheck() {
    if (!this.port) {
      this.error = "Missing nabla-db-backup port number - use 'setPort' method";
      return false;
    }

    if (!this.apiKey) {
      this.error = "Missing nabla-db-backup api key - use 'setApiKey' method";
      return false;
    }
    this.error = "";
    return true;
  }

  _createClient() {
    if (!this.port || !this.apiKey) {
      this.ready = false;
      return;
    }

    this.http = axios.create({
      withCredentials: true,
      baseURL: `http://localhost:${this.port}/v2`,
      headers: {
        common: {
          'x-nabla': this.apiKey,
          "User-Agent": this.userAgent
        }
      }
    });

    this.ready = true;
    return this;
  }
}

module.exports = NablaDbBackup;