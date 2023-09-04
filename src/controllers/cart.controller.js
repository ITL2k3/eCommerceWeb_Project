'use strict'
const { CREATED, SuccessResponse } = require("../core/success.response")
const CartService = require("../services/cart.service")
const cartServices = require("../services/cart.service")

class cartController {
    //new
    addToCart = async (req,res,next) => {
        //new
        new SuccessResponse({
            message: 'Create new Cart Success',
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }
    //update + - a product
    update = async (req,res,next) => {
       
        new SuccessResponse({
            message: 'Update Cart Success',
            metadata: await CartService.addTocartV2(req.body)
        }).send(res)
    }
    //delete
    delete = async (req,res,next) => {
     
        new SuccessResponse({
            message: 'Delete Cart Success',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }
    listToCart= async (req,res,next) => {
     
        new SuccessResponse({
            message: 'List Cart Success',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }

    
    

}

module.exports = new cartController()