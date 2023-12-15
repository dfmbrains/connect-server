require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production.local' : '.env.development.local'
});

const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE
})

module.exports = pool