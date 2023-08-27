'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const discount = require("../models/discount.model")
const { findAllDiscountCodesUnselect, updateDiscountById } = require("../models/repositories/discount.repo")
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
        if(new Date() < new Date(start_date) || new Date() > new Date(end_date)){
            throw new BadRequestError('Discount code has expried')
        }

        if(new Date(start_date) >= new Date(end_date)){
            throw new BadRequestError('Start date must be before end date')
        }

        //create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()
        console.log('shopId / convertObj(shopId)::', shopId, convertToObjectIdMongodb(shopId))

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
        code, shopId, userId, limit, page
    }){
        //create index for discount_code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

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
    }

    /*
    get all shop's discount_codes
    shopId ->dis1/dis2/dis3
    */
    static async getAlllDiscountCodesByShop({
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


}