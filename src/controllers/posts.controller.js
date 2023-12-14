const db = require("../../db");

const selectOneElement = require("../middleware/selectOneElement");

class PostsController {
  async createPost(req, res) {
    const {title, description, image} = req.body

    if (!title || !description || !image) {
      return res.json({message: `Fields are required`, value: null, status: false})
    }

    try {
      const newPost = selectOneElement(await db.query('INSERT INTO posts (user_id, title, description, image) values ($1, $2, $3, $4) RETURNING *', [req.userId, title, description, image]))

      res.json({message: '', value: newPost, status: true})
    } catch (err) {
      res.status(500).send(`Error creating post: ${err.message}`);
    }
  }

  async updatePost(req, res) {
    const {id, title, description, image} = req.body;

    if (!id) {
      return res.json({message: 'ID is required', value: null, status: false});
    }

    const fieldsToUpdate = [];
    const values = [];

    if (title) {
      fieldsToUpdate.push('title = $' + (fieldsToUpdate.length + 1));
      values.push(title);
    }

    if (description) {
      fieldsToUpdate.push('description = $' + (fieldsToUpdate.length + 1));
      values.push(description);
    }

    if (image) {
      fieldsToUpdate.push('image = $' + (fieldsToUpdate.length + 1));
      values.push(image);
    }

    if (fieldsToUpdate.length === 0) {
      return res.json({message: 'Nothing changed', value: null, status: true});
    }

    try {
      values.push(id);

      const result = await db.query(`UPDATE posts
                                     SET ${fieldsToUpdate.join(', ')}
                                     WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`, values);
      const newPost = selectOneElement(result);

      res.json({message: 'Post updated successfully', value: newPost, status: true});
    } catch (err) {
      res.status(500).send(`Error updating post: ${err.message}`);
    }
  }

  async getPopularPosts(req, res) {
    const {pageSize = 10, page = 1} = req.query

    const currentPage = Math.max(page, 1);
    const offset = (currentPage - 1) * pageSize;

    try {
      const posts = await db.query('SELECT * FROM posts ORDER BY likes LIMIT $1 OFFSET $2', [pageSize, offset])

      res.json(posts.rows)
    } catch (err) {
      res.status(500).send(`Error fetching posts: ${err.message}`);
    }
  }

  async getPostsBySubscriptions(req, res) {
    const {pageSize = 10, page = 1} = req.query

    const currentPage = Math.max(page, 1);
    const offset = (currentPage - 1) * pageSize;

    try {
      const subscriptions = await db.query('SELECT * FROM subscriptions where user_id = $1', [req.userId])
      const subsTargets = subscriptions.rows.map(sub => sub.target)

      if (subsTargets.length === 0) return res.json([]);

      const posts = await db.query('SELECT * FROM posts where user_id = ANY($1) ORDER BY created LIMIT $2 OFFSET $3', [subsTargets, pageSize, offset])

      res.json(posts.rows)
    } catch (err) {
      res.status(500).send(`Error fetching posts: ${err.message}`);
    }
  }
}

module.exports = new PostsController()