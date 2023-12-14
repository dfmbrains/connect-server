const Router = require('express')
const router = new Router()
const likesController = require('../controllers/likes.controller')

router.get('/byPost', likesController.getLikesByPost)
router.delete('/', likesController.deleteLike)
router.post('/', likesController.createLike)

module.exports = router