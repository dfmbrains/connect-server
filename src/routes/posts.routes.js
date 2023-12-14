const Router = require('express')
const router = new Router()
const postController = require('../controllers/posts.controller')

router.post('/', postController.createPost)
router.put('/', postController.updatePost)
router.get('/popular', postController.getPopularPosts)
router.get('/bySubscriptions', postController.getPostsBySubscriptions)

module.exports = router