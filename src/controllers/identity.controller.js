const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const db = require('../../db')

const selectOneElement = require("../middleware/selectOneElement");
const {v4: uuid} = require('uuid');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
}

const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, {expiresIn: '48h'})
  await db.query('INSERT INTO refresh_tokens (refresh_token) values ($1)', [refreshToken])

  return refreshToken
}

class IdentityController {
  async register(req, res) {
    const {username, password, firstName, lastName, sex} = req.body;
    if (!username || !password || !firstName || !lastName || (!sex && sex !== 0)) return res.json({'message': 'Username, password, sex, firstName and lastName are required.'});

    const duplicate = selectOneElement(await db.query('SELECT * FROM identity_users where username = $1', [username]));
    if (duplicate) return res.json({'message': 'User with this username already exist'});

    try {
      const hashedPass = await bcrypt.hash(password, 10);

      const newProfile = {
        id: uuid(),
        avatar: null,
        birthdate: null,
        updated: new Date(),
        role: 'client',
        created: new Date(),
        firstName,
        lastName,
        username,
        sex,
      };

      await db.query('INSERT INTO identity_users (password, username) values ($1, $2)', [hashedPass, username])
      await db.query('INSERT INTO profiles (id, username, firstname, lastname, avatar, birthdate, role, sex, updated, created) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [newProfile.id, newProfile.username, newProfile.firstName, newProfile.lastName, newProfile.avatar, newProfile.birthdate, newProfile.role, newProfile.sex, newProfile.updated, newProfile.created])

      res.json({'message': 'New user created!'});
    } catch (err) {
      console.log(err)
      res.status(500).json({'message': err.message});
    }
  }

  async login(req, res) {
    const {username, password} = req.body
    if (!username || !password) return res.json({'message': 'Username and password are required.'});

    try {
      const foundIdentityProfile = selectOneElement(await db.query('SELECT * FROM identity_users where username = $1', [username]));
      const foundUserProfile = selectOneElement(await db.query('SELECT * FROM profiles where username = $1', [username]));
      if (!foundIdentityProfile || !foundUserProfile) return res.sendStatus(401);

      const match = await bcrypt.compare(password, foundIdentityProfile.password);
      if (match) {
        const tokenIncludes = {username, id: foundUserProfile.id}

        const accessToken = generateAccessToken(tokenIncludes)
        const refreshToken = await generateRefreshToken(tokenIncludes)

        res.json({accessToken, refreshToken})
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({'message': err.message});
    }
  }

  async refreshToken(req, res) {
    const {refreshToken} = req.body

    if (!refreshToken) return res.sendStatus(401)

    try {
      const isIncludeRefreshToken = selectOneElement(await db.query('SELECT * FROM refresh_tokens where refresh_token = $1', [refreshToken]));
      if (!isIncludeRefreshToken) return res.sendStatus(403)

      await db.query('DELETE FROM refresh_tokens where refresh_token = $1', [refreshToken]);

      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403)
        const tokenIncludes = {password: user.username, id: user.id}

        const accessToken = generateAccessToken(tokenIncludes)
        const refreshToken = await generateRefreshToken(tokenIncludes)

        res.json({accessToken, refreshToken})
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({'message': err.message});
    }
  }
}

module.exports = new IdentityController()