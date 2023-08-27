'use strict'

const { productType } = require('../configs/config.product')
const { BadRequestError } = require('../core/error.response')
const {product, clothing, electronic, furniture} = require('../models/product.model')
const { insertInventory } = require('../models/repositories/inventory.repo')
const { findAllDraftsForShop, 
        findAllPublishForShop,
        publicProductByShop,unPublicProductByShop, 
        searchProductByUser, findAllProducts, 
        findProduct, 
        updateProductById} = require('../models/repositories/product.repo')
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils')

//defind Factory class to create product
class ProductFactory {
    /*
        type: 'Clothing',
        payload

    */
    static productRegistry = {} //key - class
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef

    }


    static async createProduct(type, payload){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

        return new productClass(payload).createProduct()
    }
    static async updateProduct(type,productId, payload){

        const productClass = ProductFactory.productRegistry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)

        return new productClass(payload).updateProduct(productId)
    }
    //PUT
    static async publicProductByShop ({product_shop, product_id}){
        return await publicProductByShop({product_shop,product_id})

    }
    static async unPublicProductByShop ({product_shop, product_id}){
        return await unPublicProductByShop({product_shop,product_id})

    }

    //ENDPUT

    //query
    static async findAllDraftsForShop({product_shop,limit = 50, skip = 0}){
        const query = {product_shop, isDraft: true}
        return await findAllDraftsForShop({query,limit,skip})
    }

    static async findAllPublishForShop({product_shop,limit = 50, skip = 0}){
        const query = {product_shop, isPublished: true}
        return await findAllPublishForShop({query,limit,skip})
    }

    static async searchProducts ({keySearch}){
        return await searchProductByUser({keySearch})

    }
    static async findAllProducts ({limit = 50, sort = 'ctime', page = 1, filter ={isPublished: true}}){
        return await findAllProducts({limit,sort,page,filter,select : ['product_name','product_price','product_thumb']})

    }
    static async findProduct ({product_id}){
        return await findProduct({product_id,unSelect: ['__v']})

    }
}

//define base product claass
class Products{
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
    }){
        this.product_name = product_name,
        this.product_thumb = product_thumb,
        this.product_description = product_description,
        this.product_price = product_price,
        this.product_quantity = product_quantity,
        this.product_type = product_type,
        this.product_shop = product_shop,
        this.product_attributes = product_attributes
    }
    //create new product
    async createProduct(product_id){
        const newProduct = await product.create({
            ...this,
            _id: product_id
        })
        if(newProduct){
            //add product_stock in inventory collection 
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            })
        }
        return newProduct
    }

    //update Product
    async updateProduct(productId, bodyUpdate){
        return await updateProductById({productId, bodyUpdate,model: product})

    }

}
//defind sub-class clothing
class Clothings extends Products{
    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
    
        if(!newClothing) throw new BadRequestError('create new Cloth error')
        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw new BadRequestError('create new Product error')
        return newProduct

    }
    async updateProduct(productId){
        //1. remove attr null or undefined
        const objectParams = this
        //2. check update position
        if(objectParams.product_attributes){
           
            //update child
            await updateProductById({productId, objectParams,model: clothing})
        }
        //update product
        const updateProduct = await super.updateProduct(productId,objectParams)
        return updateProduct
        
    }
}
class Electronics extends Products{
    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw new BadRequestError('create new Electronic error')
        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new BadRequestError('create new Product error')
        return newProduct

    }
}
class Furnitures extends Products{
    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture) throw new BadRequestError('create new Furniture error')
        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new BadRequestError('create new Product error')
        return newProduct

    }
    async updateProduct(productId){
        
        //1. remove attr null or undefined
        console.log(`[1]::`, this)
        const objectParams = removeUndefinedObject(this)
        console.log(`[2]::`, objectParams)
       
       
        //2. check update position
        if(objectParams.product_attributes){
            console.log('start')

            //update child
            await updateProductById({
                productId, 
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes),
                model: furniture
            })
        }
        //update product
        const updateProduct = await super.updateProduct(productId,updateNestedObjectParser(objectParams))
        return updateProduct
        
    }
}

//register product type
ProductFactory.registerProductType(productType.Electronic,Electronics)
ProductFactory.registerProductType(productType.Clothing,Clothings)
ProductFactory.registerProductType(productType.Furniture,Furnitures)


module.exports = ProductFactory;