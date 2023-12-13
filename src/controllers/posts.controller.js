class PostsController {
  async createPost(req, res) {
    const {title, content, userId} = req.body
    // const newPost = await db.query('INSERT INTO post (title, content, user_id) values ($1, $2, $3) RETURNING *', [title, content, userId])

    // res.json(newPost.rows[0])
    res.json('SUCCESS')
  }

  async getPosts(req, res) {
    const {userId} = req.query
    // const posts = await db.query('SELECT * FROM post where user_id = $1', [userId])

    res.json('SUCCESS')
  }
}

module.exports = new PostsController()