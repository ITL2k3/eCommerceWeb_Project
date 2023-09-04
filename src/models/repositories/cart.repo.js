'use strict'
const {cart} = require("../../models/cart.model")
const { convertToObjectIdMongodb } = require("../../utils")
const { getProductById } = require("./product.repo")

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
const findCartById = async(cartId) => {
    return cart.findOne({_id: convertToObjectIdMongodb(cartId),cart_state:'active'}).lean()
}
const checkProductByServer = async (products) => {
    return await Promise.all(products.map(async product => {
        const foundProduct = await getProductById(product.productId)
        if(foundProduct){
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId
            }
        }
    }))
}

module.exports= {
    createUserCart,
    updateUserCartQuantity,
    deleteUserCartrepo,
    findProductInCart,
    findCartById,
    checkProductByServer
}