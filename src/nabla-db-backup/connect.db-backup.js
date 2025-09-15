const mongoose = require('mongoose');
const { toJSON, paginate } = require('../db/plugins');

/**
 * Schema for Nabla backup record
 */
const backupSchema = mongoose.Schema(
  {
    file: {
      type: String,
      required: true,
      trim: true,
    },
    db: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    ip: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    userCount: {
      type: Number,
      default: 0,
    },
    dbSize: {
      type: Number,
      default: 0,
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    collectionCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
    }
  },
  {
    timestamps: true
  }
);

/**
 * Return paths to text search in paginate plugin
 * @returns {Array<string>}
 */
backupSchema.statics.searchableFields = function () {
  return ['ip', 'file', 'db'];
};

backupSchema.plugin(toJSON);
backupSchema.plugin(paginate);

/**
 * Connect to Nabla DB Backup database
 * 
 * @param {*} uri MongoDB URI or connection string
 * @param {*} options MongoDB connection options
 * @returns 
 */
// function connectionFactory(uri, options = {}) {

//   const conn = mongoose.createConnection(uri, options);
//   conn.model('Backup', backupSchema);
//   return conn;
// };

/**
 * 
 * @param {object} config MongoDB configuration settings
 *                        - uri or connection string
 *                        - options MongoDB connection options
 * 
 * @param {object} filter MongoDB query filter
 * 
 * @param {object} options Pagination options 
 *                          - sortBy
 *                          - limit
 *                          - page
 *                          
 * @param {string} search Regex text search in the searchableFields static function
 * 
 * @returns {object} Pagination Response
 *                    - results - Array of documents for the requested page number
 *                    - page - the requested page number
 *                    - limit - number of records per page
 *                    - totalPages - number of pages with the requested limit
 *                    - totalResults - number of results from query using the requested filter, before pagination
 */
// module.exports = function query(config, filter, options, search) {
//   const db = connectionFactory(config.uri, config.options)
//   return db.models.Backup.paginate(filter, options, search);
// }

module.exports = {
  backupSchema
}