const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[authHeader.split(' ').length - 1]

    if (!token || token.length < 10) return res.sendStatus(401)

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403)

      req.userId = decoded.userId
      next()
    })
  } catch (e) {
    console.log(e.message)
    return res.sendStatus(401)
  }
}

module.exports = verifyJWT