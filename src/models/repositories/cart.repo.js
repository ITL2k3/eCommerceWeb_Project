'use strict'
const {cart} = require("../../models/cart.model")

const createUserCart = async({userId, product})=>{
    const query = {cart_userId: userId,cart_state: 'active'},
    updateOrInsert = {
        $addToSet:{
            cart_products: product
        }
    }, options= {upsert: true, new: true}
    return await cart.findOneAndUpdate(query,updateOrInsert,options)
}
const updateUserCartQuantity = async({userId, product})=>{
    
    const {productId, quantity} = product
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
    },updateSet = {
        $inc:{
            'cart_products.$.quantity': quantity
        }

    },options = {upsert: true, new: true}
    
    return await cart.findOneAndUpdate(query,updateSet,options)
}
const deleteUserCartrepo = async({userId, productId}) => {
    const query = {cart_userId: userId, cart_state : 'active'},
        updateSet = {
            $pull:{
                cart_products: {
                    productId
                }
            }
        }
        return await cart.updateOne(query, updateSet)
}
const findProductInCart = async ({userId, productId}) => {
    const query = {
        cart_userId: userId,
        cart_products: {
            $elemMatch: {productId: productId}
        }
    }
    return await cart.findOne(query)
}

module.exports= {
    createUserCart,
    updateUserCartQuantity,
    deleteUserCartrepo,
    findProductInCart
}