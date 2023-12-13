const Router = require('express')
const router = new Router()
const postController = require('../controllers/posts.controller')

router.get('/', postController.getPosts)

module.exports = router