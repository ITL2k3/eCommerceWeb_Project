'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const discount = require("../models/discount.model")
const { findAllDiscountCodesUnselect, updateDiscountById, checkDiscountExists } = require("../models/repositories/discount.repo")
const { findAllProducts } = require("../models/repositories/product.repo")
const { 
    convertToObjectIdMongodb
} = require("../utils")

/*
    Discount Services
    1 - Generator Discount Code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [User | Shop]
    4 - Verify discount code [User]
    5 - Delete discount code [Admin | Shop]
    6 - Cancel discount code [User]
*/
class DiscountServices {
    static async createDiscountCode (payload){
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count,users_used, max_uses_per_user 
        } = payload
        // kiem tra
        // if(new Date() < new Date(start_date) || new Date() > new Date(end_date)){
        //     throw new BadRequestError('Discount code has expried')
        // }

        if(new Date(start_date) >= new Date(end_date)){
            throw new BadRequestError('Start date must be before end date')
        }

        //create index for discount code
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })
        // console.log('shopId / convertObj(shopId)::', shopId, convertToObjectIdMongodb(shopId))

        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exists!')
        }

        const newDiscount = await discount.create({
            discount_name:name,
            discount_description: description,
            discount_types: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date:new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids:applies_to === 'all' ? [] : product_ids
        })
        return newDiscount

    }

    static async updateDiscountCode (discount_id, bodyUpdate){
        return await updateDiscountById({discount_id,bodyUpdate,model:discount})


    }
    /*
        Get list products by Discount Code:
        discount_code : product1,pro2,pro3,...
    */
    static async getAllDiscountCodeWithProduct({
        code, shopId, limit, page
    }){
        
        //create index for discount_code
        const foundDiscount = await checkDiscountExists({
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })
        

        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('discount not exists!')
        }
        const {discount_applies_to,discount_product_ids} = foundDiscount
        let products
        if(discount_applies_to === 'all'){
            //get all product
            products = await findAllProducts({
                filter:{
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',//closest time
                select: ['product_name']
            })
        }
       
        if(discount_applies_to === 'specific'){
            //get the product ids
            products = await findAllProducts({
                filter:{
                    _id: {$in: discount_product_ids},
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']

            })
        }
      
        return products
    }

    /*
    get all shop's discount_codes
    shopId ->dis1/dis2/dis3
    */
    static async getAllDiscountCodesByShop({
        limit, page, shopId  
    }){
      
        const discounts = await findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v','discount_shopId'],
            model: discount
        })
       
        return discounts
    }
    /*
        Get discount_code amount

        discount_code: 10% - order 1
                        5% - order 2
                        2% - order 3
        products = [
            {
                proId,
                shopId,
                quantity,
                name,
                price
            },
            {
                proId,
                shopId,
                quantity,
                name,
                price
            }
        ]
    
    */
   static async getDiscountAmount({codeId, userId, shopId, products}){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })
        if(!foundDiscount) throw new NotFoundError(`Discount doesn't exist`)
        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_user_used,
            discount_max_uses_per_user,
            discount_end_date,
            discount_start_date,
            discount_type,
            discount_value
        } = foundDiscount
        if(!discount_is_active) throw new NotFoundError(`Discount expired!`)
        if(!discount_max_uses) throw new NotFoundError(`Discount are out!`)
        //check xem co gia tri thoi thieu ko
        let totalOrder = 0
        if(discount_min_order_value > 0){
            //get total
            totalOrder = products.reduce((acc, product)=> {
                return acc + (product.quantity * product.price)
            },0)
            console.log('totalOrder:', totalOrder)
            if(totalOrder < discount_min_order_value){
                throw new NotFoundError(`discount required a minium order value of ${discount_min_order_value}`)
            }
        }
        // console.log('uid:',userId)
        if(discount_max_uses_per_user > 0){
            // const userUserDiscount = discount.find({discount_users_used:{$in:"userId"}})
            const userUserDiscount = await discount.findOne({
                discount_users_used: {
                    $elemMatch: {userId: userId}
                }

            })
            // const userUserDiscount = discount_user_used.find(user => user.userId === userId)
           
            if(userUserDiscount){
                throw new BadRequestError(`1 Discount per account`)

            }
        }
        //check xem discount la fixed_amount-
        const amount = discount_type ==='fixed_amount' ? discount_value : totalOrder*(discount_value) / 100

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }


    }
    static async deleteDiscountCode({shopId, codeId}){
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })
        return deleted
    }
    static async cancelDiscountCode({codeId, shopId, userId}){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter:{
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })
        if(!foundDiscount) throw NotFoundError(`Discount doesn't exist`)
        
        const result = await discount.findByIdAndUpdate(foundDiscount._id,{
            $pull:{
                discount_users_used: userId,
            },
            $inc:{
                discount_max_uses: 1,
                discount_uses_count: -1
            }

        })
        return result


    }


}
module.exports = DiscountServices