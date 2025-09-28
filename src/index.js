const NablaDbBackup = require("./nabla-db-backup/db-backup.service");


class MoontowerSDK {
  constructor(options) {


    /** Nabla DB Backup */
    this.dbBackup = new NablaDbBackup(options?.dbBackup);
  }
}



module.exports = (opts) => new MoontowerSDK(opts)