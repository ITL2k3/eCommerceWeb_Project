'use strict'
const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../helper/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()



//signUp

router.use('/shop/signup', asyncHandler(accessController.signUp))

//login

router.use('/shop/login', asyncHandler(accessController.login))

// authentication //
router.use(authentication)

// logout

router.use('/shop/logout', asyncHandler(accessController.logout))
router.use('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken))



module.exports = router