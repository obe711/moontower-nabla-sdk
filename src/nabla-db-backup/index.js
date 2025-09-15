const NablaDbBackup = require("./db-backup.service")


const dbBackup = new NablaDbBackup({
  // uri: "mongodb://127.0.0.1:27017/nabla-db-backup",
  uri: "mongodb://127.0.0.1:27017/nabla-db-backup",
  mongoOptions: {},
  baseURL: "http://localhost:4000/v1",
  basePort: 4000,
  nablaApiKey: "1234567890",
  userAgent: "Nabla-1.0.0",
});


dbBackup.on("nabla-error", (err) => {
  console.warn("dbBackup.on error", err)
});


dbBackup.createBackup("mosquitto");

