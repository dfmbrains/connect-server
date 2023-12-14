const db = require("../../db");

const selectOneElement = require("../middleware/selectOneElement");

class LikesController {
  async getLikesByPost(req, res) {
    const {postId} = req.query

    if (!postId) {
      return res.json({message: `PostId is required`, value: null, status: false})
    }

    try {
      const likes = await db.query('SELECT * FROM likes where post_id = $1 ORDER BY created', [postId])
      const profilesIds = likes.rows.map(like => like.user_id)

      if (profilesIds.length === 0) return res.json([]);

      const profiles = await db.query('SELECT * FROM profiles where id = ANY($1) ORDER BY created', [profilesIds])

      res.json({message: '', value: profiles.rows, status: true})
    } catch (err) {
      res.status(500).send(`Error getting likes by post: ${err.message}`);
    }
  }

  async createLike(req, res) {
    const {postId} = req.query

    if (!postId) return res.json({message: `PostId is required`, value: null, status: false})

    try {
      const isDuplicate = selectOneElement(await db.query('SELECT * FROM likes where user_id = $1 AND post_id = $2', [req.userId, postId]));
      if (isDuplicate) return res.json({message: `Already liked`, value: null, status: false})

      const like = selectOneElement(await db.query('INSERT INTO likes (user_id, post_id) values ($1, $2) RETURNING *', [req.userId, postId]))
      await db.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [postId]);

      res.json({message: '', value: like, status: true})
    } catch (err) {
      res.status(500).send(`Error creating like: ${err.message}`);
    }
  }

  async deleteLike(req, res) {
    const {postId} = req.query

    if (!postId) {
      return res.json({message: `PostId is required`, value: null, status: false})
    }

    try {
      const likeCheckResult = selectOneElement(await db.query('SELECT * FROM likes WHERE user_id = $1 AND post_id = $2', [req.userId, postId]));
      if (!likeCheckResult) {
        return res.json({message: 'Like does not exist', value: null, status: false});
      }

      await db.query('DELETE FROM likes where user_id = $1 AND post_id = $2', [req.userId, postId]);
      await db.query('UPDATE posts SET likes = likes - 1 WHERE id = $1', [postId]);

      res.json({message: '', value: 'success', status: true});
    } catch (err) {
      res.status(500).send(`Error deleting like: ${err.message}`);
    }
  }
}

module.exports = new LikesController()