'use strict'
const express = require('express')
const { asyncHandler } = require('../../helper/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const discountController = require('../../controllers/discount.controller')
const router = express.Router()
//get amount of discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.get('/list_product_code', asyncHandler(discountController.getDiscountCodeWithProducts))

// authentication //s
router.use(authentication)

router.post('',asyncHandler(discountController.createDiscountCode))
router.get('',asyncHandler(discountController.getAllDiscountCodes))

module.exports = router