const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const db = require('../../db')

const selectOneElement = require("../middleware/selectOneElement");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

const ACCESS_TOKEN_EXPIRES_HOURS = 24
const REFRESH_TOKEN_EXPIRES_HOURS = 48

const generateAccessToken = (userId) => {
  return jwt.sign({userId}, ACCESS_TOKEN_SECRET, {expiresIn: `${ACCESS_TOKEN_EXPIRES_HOURS}h`})
}

const generateRefreshToken = async (userId) => {
  const refreshToken = jwt.sign({userId}, REFRESH_TOKEN_SECRET, {expiresIn: `${REFRESH_TOKEN_EXPIRES_HOURS}h`})
  await db.query('INSERT INTO refresh_tokens (refresh_token) values ($1)', [refreshToken])

  return refreshToken
}

class IdentityController {
  async register(req, res) {
    const {username, password, firstName, lastName} = req.body;
    if (!username || !password || !firstName || !lastName) return res.json({message: 'Username, password, firstName and lastName are required.'});

    const duplicate = selectOneElement(await db.query('SELECT * FROM identity_users where username = $1', [username]));
    if (duplicate) return res.json({message: 'User with this username already exist', status:false});

    try {
      const hashedPass = await bcrypt.hash(password, 10);

      const identityProfile = selectOneElement(await db.query('INSERT INTO identity_users (password, username) values ($1, $2) RETURNING *', [hashedPass, username]))
      await db.query('INSERT INTO profiles (id, firstname, lastname) values ($1, $2, $3)', [identityProfile.id, firstName, lastName])

      res.json({message: 'Signed up successfully', status: true});
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err.message});
    }
  }

  async login(req, res) {
    const {username, password} = req.body
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required.',
        status: false,
        value: null
      });
    }

    try {
      const foundIdentityProfile = selectOneElement(await db.query('SELECT * FROM identity_users where username = $1', [username]));
      if (!foundIdentityProfile) {
        return res.status(401).json({
          message: 'Not registered',
          status: false,
          value: null
        });
      }

      const foundUserProfile = selectOneElement(await db.query('SELECT * FROM profiles where id = $1', [foundIdentityProfile.id]));
      if (!foundUserProfile) {
        return res.status(401).json({
          message: 'Not registered',
          status: false,
          value: null
        });
      }

      const match = await bcrypt.compare(password, foundIdentityProfile.password);
      if (match) {
        const tokenIncludes = foundUserProfile.id

        const accessToken = generateAccessToken(tokenIncludes)
        const refreshToken = await generateRefreshToken(tokenIncludes)

        res.json({accessToken, refreshToken, expiresHours: REFRESH_TOKEN_EXPIRES_HOURS})
      } else {
        res.status(401).json({
          message: 'Password is not correct',
          status: false,
          value: null
        });
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err.message});
    }
  }

  async refreshToken(req, res) {
    const {refreshToken} = req.body

    if (!refreshToken) return res.sendStatus(401)

    try {
      const isIncludeRefreshToken = selectOneElement(await db.query('SELECT * FROM refresh_tokens where refresh_token = $1', [refreshToken]));
      if (!isIncludeRefreshToken) return res.sendStatus(403)

      await db.query('DELETE FROM refresh_tokens where refresh_token = $1', [refreshToken]);

      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, {userId}) => {
        if (err) return res.sendStatus(403)

        const accessToken = generateAccessToken(userId)
        const refreshToken = await generateRefreshToken(userId)

        res.json({accessToken, refreshToken, expiresHours: REFRESH_TOKEN_EXPIRES_HOURS})
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err.message});
    }
  }
}

module.exports = new IdentityController()