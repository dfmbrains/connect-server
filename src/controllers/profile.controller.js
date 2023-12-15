const selectOneElement = require("../middleware/selectOneElement");
const db = require("../../db");

class ProfileController {
  async getProfile(req, res) {
    try {
      const foundUserProfile = selectOneElement(await db.query('SELECT * FROM profiles where id = $1', [req.userId]));

      if (foundUserProfile) {
        return res.json(foundUserProfile)
      } else {
        return res.sendStatus(403)
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err.message});
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