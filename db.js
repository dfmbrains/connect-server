require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production.local' : '.env.development.local'
});

const Pool = require('pg').Pool

const poolOptions = {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
}

if (poolOptions === 'production') {
  poolOptions.ssl = {
    rejectUnauthorized: false,
    require: true,
    mode: 'require'
  }
}

const pool = new Pool(poolOptions)

module.exports = pool