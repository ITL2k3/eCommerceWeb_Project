'use strict'
const { CREATED, SuccessResponse } = require("../core/success.response")
const DiscountServices = require("../services/discount.service")

class DiscountController {
    createDiscountCode = async (req,res,next) => {
        new SuccessResponse({
            message: 'Successful Code Discount',
            metadata: await DiscountServices.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCodes = async (req,res,next) => {
        new SuccessResponse({
            message: 'getl All discount Codes success!',
            metadata: await DiscountServices.getAllDiscountCodesByShop({
                ...req.query,
            })
        }).send(res)
    }

    getDiscountAmount = async (req,res,next) => {
        new SuccessResponse({
            message: 'get DiscountAmount success!',
            metadata: await DiscountServices.getDiscountAmount({
                ...req.body,
            })
        }).send(res)
    }

    getDiscountCodeWithProducts = async (req,res,next) => {
        new SuccessResponse({
            message: 'get Discount code with products success!',
            metadata: await DiscountServices.getAllDiscountCodeWithProduct({
                ...req.query,
            })
        }).send(res)
    }
  
    

}

module.exports = new DiscountController()