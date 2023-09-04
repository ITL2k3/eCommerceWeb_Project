'use strict'
const express = require('express')
const { asyncHandler } = require('../../helper/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const inventoryController = require('../../controllers/inventory.controller')
const router = express.Router()

route.use(authentication)
router.post('', asyncHandler(inventoryController.addStockToInventory))

module.exports = router