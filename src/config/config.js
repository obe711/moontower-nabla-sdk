const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });


const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),

    AWS_ACCESS_KEY: Joi.string().description('Aws access key'),
    AWS_SECRET: Joi.string().description('Aws secret key'),
    AWS_REGION: Joi.string().description('Aws region'),


    NABLA_PORT: Joi.number().description("Nabla Port"),
    NABLA_HOSTNAME: Joi.string().description("Nabla Hostname - the server's hostname or droplet name"),
    NABLA_SITENAME: Joi.string().description("Nabla Site name - the api's site name"),
    MONGO_DB_BACKUP_URL: Joi.string().description("Mongo DB Backup URL"),
    MONGO_DB_NAME: Joi.string().description("Mongo DB"),
    SPACES_KEY: Joi.string().description('Digital Ocean spaces access key'),
    SPACES_SECRET: Joi.string().description('Digital Ocean spaces secret key'),
    SPACES_REGION: Joi.string().description('Digital Ocean spaces region'),
    SPACES_ENDPOINT: Joi.string().description('Digital Ocean spaces endpoint'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    expireAfterSec: 10,
    options: {},
  },
  nablaPort: envVars.NABLA_PORT,
  nabla: {
    hostname: envVars.NABLA_HOSTNAME,
    sitename: envVars.NABLA_SITENAME,
  },
  mongoDbBackupUrl: envVars.MONGO_DB_BACKUP_URL,
  mongoDbName: envVars.MONGO_DB_NAME,
  s3: {
    config: {
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
      endpoint: envVars.SPACES_ENDPOINT,
      region: envVars.SPACES_REGION,
      credentials: {
        accessKeyId: envVars.SPACES_KEY,
        secretAccessKey: envVars.SPACES_SECRET
      }
    },
    buckets: {
      // add buckets
    }
  },
}