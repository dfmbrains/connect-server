const Router = require('express')
const router = new Router()

const upload = require("../middleware/saveFile");

const filesController = require('../controllers/files.controller')
const express = require("express");

router.post('/image', upload.single('file'), filesController.createImage)
router.get('/image', express.static('static'), filesController.getImageById)
router.delete('/image', filesController.deleteImageById)

module.exports = router