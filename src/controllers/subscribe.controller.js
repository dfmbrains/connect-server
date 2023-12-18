const db = require("../../db");

const selectOneElement = require("../middleware/selectOneElement");

class SubscribeController {
  async getUserSubscribersCount(req, res) {
    const {targetUserId} = req.query

    if (!targetUserId) {
      return res.json({message: `TargetUserId is required`, value: null, status: false})
    }

    try {
      const targetCount = selectOneElement(await db.query('SELECT COUNT(*) FROM subscriptions WHERE target = $1', [targetUserId]))

      res.json({message: '', value: +targetCount.count, status: true})
    } catch (err) {
      res.status(500).send(`Error getting subscribes by target: ${err.message}`);
    }
  }

  async getIsProfileSubbed(req, res) {
    const {targetUserId} = req.query

    if (!targetUserId) {
      return res.json({message: `TargetUserId is required`, value: null, status: false})
    }

    try {
      const subscriber = selectOneElement(await db.query('SELECT * FROM subscriptions where target = $1 AND user_id = $2', [targetUserId, req.userId]))

      res.json({message: '', value: !!subscriber, status: true})
    } catch (err) {
      res.status(500).send(`Error getting like status: ${err.message}`);
    }
  }

  async getUserSubscribers(req, res) {
    const {targetUserId} = req.query

    if (!targetUserId) {
      return res.json({message: `TargetUserId is required`, value: null, status: false})
    }

    try {
      const subscribers = await db.query('SELECT * FROM subscriptions where target = $1 ORDER BY created', [targetUserId])
      const subscribersIds = subscribers.rows.map(sub => sub.user_id)

      if (subscribersIds.length === 0) return res.json([]);

      const profiles = await db.query('SELECT * FROM profiles where id = ANY($1) ORDER BY created', [subscribersIds])

      res.json({message: '', value: profiles.rows, status: true})
    } catch (err) {
      res.status(500).send(`Error getting subscribes by target: ${err.message}`);
    }
  }

  async getSubscribesByUser(req, res) {
    const {userId} = req.query

    if (!userId) {
      return res.json({message: `UserId is required`, value: null, status: false})
    }

    try {
      const subscribes = await db.query('SELECT * FROM subscriptions where user_id = $1 ORDER BY created', [userId])
      const subsTargets = subscribes.rows.map(sub => sub.target)

      if (subsTargets.length === 0) return res.json([]);

      const profiles = await db.query('SELECT * FROM profiles where id = ANY($1) ORDER BY created', [subsTargets])

      res.json({message: '', value: profiles.rows, status: true})
    } catch (err) {
      res.status(500).send(`Error getting subscribers by user: ${err.message}`);
    }
  }

  async createSubscribe(req, res) {
    const {targetUserId} = req.query

    if (!targetUserId) return res.json({message: `TargetUserId is required`, value: null, status: false})
    if (targetUserId === req.userId) {
      return res.json({message: `You can not subscribe yourself`, value: null, status: false})
    }

    try {
      const isDuplicate = selectOneElement(await db.query('SELECT * FROM subscriptions where user_id = $1 AND target = $2', [req.userId, targetUserId]));
      if (isDuplicate) return res.json({message: `Already subscribed`, value: null, status: false})

      const subscribe = selectOneElement(await db.query('INSERT INTO subscriptions (user_id, target) values ($1, $2) RETURNING *', [req.userId, targetUserId]))

      res.json({message: '', value: subscribe, status: true})
    } catch (err) {
      res.status(500).send(`Error creating subscribe: ${err.message}`);
    }
  }

  async deleteSubscribe(req, res) {
    const {targetUserId} = req.query

    if (!targetUserId) {
      return res.json({message: `TargetUserId is required`, value: null, status: false})
    }

    try {
      const subCheckResult = selectOneElement(await db.query('SELECT * FROM subscriptions WHERE user_id = $1 AND target = $2', [req.userId, targetUserId]));
      if (!subCheckResult) {
        return res.json({message: 'Subscribe does not exist', value: null, status: false});
      }

      await db.query('DELETE FROM subscriptions where user_id = $1 AND target = $2', [req.userId, targetUserId]);

      res.json({message: '', value: 'success', status: true});
    } catch (err) {
      res.status(500).send(`Error deleting subscribe: ${err.message}`);
    }
  }
}

module.exports = new SubscribeController()