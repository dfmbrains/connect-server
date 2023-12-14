const Router = require('express')
const router = new Router()
const profileController = require('../controllers/profile.controller')

router.get('/', profileController.getProfile)
router.get('/byId', profileController.getProfileById)

module.exports = router