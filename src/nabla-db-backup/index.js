const NablaDbBackup = require("./db-backup.service")


const dbBackup = new NablaDbBackup();


dbBackup.on("error", (err) => {
  console.error("dbBackup.on error", err)
});




