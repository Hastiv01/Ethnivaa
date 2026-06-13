const { Sequelize } = require('sequelize');
require('dotenv').config();

const toBool = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return String(value).toLowerCase() === 'true';
};

const dbName = process.env.DB_NAME || 'ethnivaa_dev';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASS || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dialect = process.env.DB_DIALECT || 'postgres';
const databaseUrl = process.env.DATABASE_URL;
const useSsl = toBool(process.env.DB_SSL, false);
const rejectUnauthorized = toBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, false);

const baseOptions = {
  dialect,
  logging: false,
  define: {
    timestamps: true,
    paranoid: true,
    underscored: true,
  },
};

if (useSsl) {
  baseOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized,
    },
  };
}

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, baseOptions)
  : new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      ...baseOptions,
    });

module.exports = sequelize;
