'use strict'
const { BadRequestError, NotFoundError } = require("../core/error.response")

const {cart} = require("../models/cart.model")
const { createUserCart, updateUserCartQuantity, deleteUserCartrepo, findProductInCart } = require("../models/repositories/cart.repo")
const { getProductById } = require("../models/repositories/product.repo")

/*
    Cart Service[User]:
    1 - Add product to Cart 
    2 - Reduce product quantity
    3 - Increase product quantity
    4 - Get list to Cart
    5 - Delete Cart
    6 - Delete cart item
 */
class CartService {
    
    static async addToCart({userId, product = {}}){
        //check cart exists
        
        const userCart = await cart.findOne({cart_userId: userId})
       
       
        if(!userCart){
            //create new cart for user
            return await createUserCart({userId, product})
        }
        //if cart already exist but have 0 product
        
        if(!userCart.cart_products.length){
            userCart.cart_products = [product]
            return await userCart.save()
        }
        //if cart already exist and product not found in cart
        const foundProduct = await findProductInCart({userId,productId: product.productId})
        console.log('FP',foundProduct)
        if(!foundProduct){
            return await createUserCart({userId, product})
        }
        
       
        //if cart already exist and product already found in cart -> update the quantity
        return await updateUserCartQuantity({userId, product})
    }
    //update cart
    /*
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                ..version
            }
        ]
    */
    static async addTocartV2({userId, shop_order_ids = {}}){
        const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0]
        
        //check product
        const foundProduct = await getProductById(productId)
        if(!foundProduct) throw new NotFoundError('Product not found')
        //compare
        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
        throw new NotFoundError('Product do not belong to the shop')
        if(quantity === 0){
            //delete
        }
        return await updateUserCartQuantity({
            userId,
            product:{
                productId,
                quantity: quantity - old_quantity
            }
        })

    }

    static async deleteUserCart({userId, productId}){
        
        const deleteCart = await deleteUserCartrepo({userId, productId})
        return deleteCart
    }
    static async getListUserCart({userId}){
        return await cart.findOne({
            cart_userId: +userId
        }).lean()
    }
}
module.exports = CartService

