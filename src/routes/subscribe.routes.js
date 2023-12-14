const Router = require('express')
const router = new Router()
const subscribeController = require('../controllers/subscribe.controller')

router.post('/', subscribeController.createSubscribe)
router.delete('/', subscribeController.deleteSubscribe)
router.get('/byTarget', subscribeController.getUserSubscribers)
router.get('/byUser', subscribeController.getSubscribesByUser)

module.exports = router