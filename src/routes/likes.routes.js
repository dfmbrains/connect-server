const Router = require('express')
const router = new Router()
const likesController = require('../controllers/likes.controller')

router.get('/byPost', likesController.getLikesByPost)
router.get('/isProfileLiked', likesController.getIsProfileLiked)
router.get('/count', likesController.getLikesCount)
router.delete('/', likesController.deleteLike)
router.post('/', likesController.createLike)

module.exports = router