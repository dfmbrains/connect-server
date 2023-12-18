const selectOneElement = require("../middleware/selectOneElement");
const db = require("../../db");

const getTopFiveProfiles = async (id) => {
  return await db.query(
    'SELECT p.* FROM profiles p WHERE p.id != $1 AND NOT EXISTS(SELECT 1 FROM subscriptions s WHERE s.user_id = $1 AND s.target = p.id) GROUP BY p.id ORDER BY (SELECT COUNT(*) FROM subscriptions s WHERE s.target = p.id) DESC LIMIT 5',
    [id]
  );
}

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

  async getRecommendedProfiles(req, res) {
    const {id} = req.query;

    const user = selectOneElement(await db.query('SELECT * FROM profiles where id = $1', [id]));

    if (user) {
      const subscribes = await db.query('SELECT * FROM subscriptions where user_id = $1 ORDER BY created', [id])
      const subsTargets = subscribes.rows.map(sub => sub.target)

      if (subsTargets.length === 0) {
        const topFiveQuery = await getTopFiveProfiles(id)
        return res.json(topFiveQuery.rows);
      }

      const recommendedProfilesQuery = await db.query(
        'SELECT p.* FROM profiles p INNER JOIN subscriptions s ON p.id = s.target WHERE s.user_id = ANY($1) AND p.id != $2 AND NOT EXISTS(SELECT 1 FROM subscriptions sub     WHERE sub.user_id = $2 AND sub.target = p.id ) GROUP BY p.id ORDER BY COUNT(s.user_id) DESC LIMIT 5',
        [subsTargets, id]
      );

      if (recommendedProfilesQuery.rows.length === 0) {
        const topFiveQuery = await getTopFiveProfiles(id)
        return res.json(topFiveQuery.rows);
      } else {
        res.json(recommendedProfilesQuery.rows);
      }
    } else {
      res.json({message: 'Profile not found', value: null, status: false})
    }
  }
}

module.exports = new ProfileController()