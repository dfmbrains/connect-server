const Router = require('express')
const router = new Router()
const identityController = require('../controllers/identity.controller')

router.post("/register", identityController.register)
router.post("/login", identityController.login)
router.post("/refresh", identityController.refreshToken)

module.exports = router