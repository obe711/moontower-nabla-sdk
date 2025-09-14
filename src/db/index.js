const mongoose = require('mongoose');
const os = require('os');
const config = require('../config/config');
const logger = require('../config/logger');

/**
 * 
 * @brief Simple MongoDB connector w/ callback
 * 
 * @example
 * 
 * - HTTP server
 * connectToDatabase(() => {
 *  const server = app.listen(config.port, () => {
 *    logger.info(`Listening to port ${config.port}`);
 *  });
 * })
 * 
 * - Node script
 * connectToDatabase(async () => {
 *   const found = await Users.findOne({ email: "obe@aol.com" })
 *   ...
 * }) 
 *
 * @param {function} callback
 */
async function connectToDatabase(callback) {
  mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    logger.info("Connected successfully to MongoDB (Simple)");
    callback();
  }).catch((error) => {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  });
}

/**
 * 
 * @brief High performance MongoDB async connector
 * 
 * - pools db connections based on system CPU count
 * - and allows for better DB event handling
 * 
 * @example
 * 
 * - HTTP server
 * try {
 *  const db = await connectToDatabase(false);
 * 
 *  db.on('error', (err) => {
 *    logger.error(`MongoDB connection error: ${err.messge}`);
 *  });
 * 
 *  db.on('disconnected', () => {
 *    logger.warn('MongoDB disconnected');
 *    // - You might want to pause accepting new requests here
 *  });
 * 
 *  db.on('reconnected', () => {
 *    logger.info('MongoDB reconnected');
 *    // - Resume normal operations
 *  });
 * 
 *  const server = app.listen(config.port, () => {
 *    logger.info(`MongoDB connected & http server on ${config.port}`);
 *  });
 * 
 * } catch (error) {
 *    logger.error(`Failed to start the Nexus System: ${error.message}');
 *    process.exit(1);
 * }
 * 
 * @param {boolean} enableMonitoring 
 * @returns {mongoose.Connection}
 */
async function connectToDatabasePro(enableMonitoring = false) {
  const numCPUs = os.cpus().length;
  try {
    await mongoose.connect(config.mongoose.url, {
      ...config.mongoose.options,
      maxPoolSize: (numCPUs * 2) + 1,
      minPoolSize: 2,
    });
    logger.info("Connected successfully to MongoDB (Pro)");

    if (enableMonitoring) {
      startMonitoring();
    }
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  return mongoose.connection;
}

/**
 * @brief MongoDB connection monitoring tool
 * - For diagnostics and debug, not recommended for production
 */
function startMonitoring() {
  const monitoringInterval = setInterval(async () => {
    try {
      const client = mongoose.connection.getClient();
      const db = client.db();
      const serverStatus = await db.command(config.mongoose.monitorOptions.logOptions);
      logger.info("\n");
      logger.info('Database connection status:');
      logger.info(`- Current connections: ${serverStatus.connections.current}`);
      logger.info(`- Available connections: ${serverStatus.connections.available}`);
      logger.info(`- Active connections: ${serverStatus.connections.active}`);

      // Get more detailed Mongoose-specific connection information
      if (mongoose.connection.pool) {
        logger.info("\n");
        logger.info('Mongoose connection pool status:');
        logger.info(`- Pool size: ${mongoose.connection.pool.size}`);
        logger.info(`- Available connections: ${mongoose.connection.pool.available}`);
      }

      // Log current operations (as an alternative to connection pool stats)
      const currentOps = await db.admin().command(config.mongoose.monitorOptions.currentOperationsLog);
      logger.info(`- Current active operations: ${currentOps.inprog.length}`);

    } catch (error) {
      logger.error(`Error while monitoring database connection: ${error.message}`);
    }
  }, config.mongoose.monitorOptions.logInterval);

  mongoose.connection.on('close', () => {
    clearInterval(monitoringInterval);
    logger.info('Database connection closed. Monitoring stopped.');
  });
}

module.exports = {
  connectToDatabase,
  connectToDatabasePro
};