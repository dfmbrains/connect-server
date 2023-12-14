const selectOneElement = require("../middleware/selectOneElement");
const db = require("../../db");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

class ProfileController {
  async getProfile(req, res) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    try {
      jwt.verify(token, ACCESS_TOKEN_SECRET, async (err, {userId}) => {
        if (err) return res.sendStatus(403)

        const foundUserProfile = selectOneElement(await db.query('SELECT * FROM profiles where id = $1', [userId]));

        if (foundUserProfile) {
          return res.json(foundUserProfile)
        } else {
          return res.sendStatus(403)
        }
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({'message': err.message});
    }
  }

  async getProfileById(req, res) {
    const {id} = req.query;

    const user = selectOneElement(await db.query('SELECT * FROM profiles where id = $1', [id]));

    if (user) {
      res.json({message: '', value: user, status: true})
    } else {
      res.json({message: 'Profile not found', value: null, status: false})
    }
  }
}

module.exports = new ProfileController()