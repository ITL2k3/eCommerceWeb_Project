'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const ProductService = require("../services/product.service")

class ProductController {
    createProduct = async(req,res,next) => {
       
    
        new SuccessResponse({
            message: 'Create new product success!',
            metadata: await ProductService.createProduct(req.body.product_type,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    //update product
    updateProduct = async(req,res,next) => {
       
        new SuccessResponse({
            message: 'Update product success!',
            metadata: await ProductService.updateProduct(req.body.product_type,req.params.productId,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async(req,res,next) => {
        new SuccessResponse({
            message: 'Publish product success!',
            metadata: await ProductService.publicProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    unPublishProductByShop = async(req,res,next) => {
        new SuccessResponse({
            message: 'unPublish product success!',
            metadata: await ProductService.unPublicProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    
    
    //Query
    /**
     * @description Get All Drafts for shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON} 
     */
    getAllDraftsForShop = async(req,res,next) => {
        new SuccessResponse({
            message: 'Get list Draft success!',
            metadata: await ProductService.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublishForShop = async(req,res,next) => {
        new SuccessResponse({
            message: 'Get list Publish success!',
            metadata: await ProductService.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }
    
    getListSearchProduct = async(req,res,next) => {
        new SuccessResponse({
            message: 'Get list-search product success!',
            metadata: await ProductService.searchProducts(req.params)
        }).send(res)
    }
    findAllProduct = async(req,res,next) => {
        new SuccessResponse({
            message: 'Get list findAllproduct success!',
            metadata: await ProductService.findAllProducts(req.query)
        }).send(res)
    }
    findProduct = async(req,res,next) => {

        new SuccessResponse({
            message: 'Get findProduct success!',
            metadata: await ProductService.findProduct({
                product_id :req.params.id
                
            })
        }).send(res)
    }


    //End Query
    
}
module.exports = new ProductController()