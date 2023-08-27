'use strict'

const { model, Schema, Types } = require('mongoose'); // Erase if already required
const slugify = require('slugify')
const DOCUMENT_NAME = {
    PRODUCT: 'Products',
    CLOTH:'Clothings',
    ELECTRONIC: 'Electronics',
    FURNITURE: 'Furnitures'

}
const COLLECTION_NAME = {
    PRODUCT: 'products',
    CLOTH: 'clothes',
    ELECTRONIC: 'electronics',
    FURNITURE: 'furnitures'
}

// Declare the Schema of the Mongo model
const productSchema = new Schema({
    product_name: {
        type: String,
        required: true,
    },
    product_thumb: {
        type: String,
        required: true,
    },
    product_description: String,
    product_slug: String,
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronic', 'Clothing', 'Furniture']
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    product_attributes:{
        type: Schema.Types.Mixed,
        required: true
    },
    //More
    product_ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        //round
        set: (val) => Math.round((val *10)/10)
    },
    product_variations: {
        type: Array,
        default: []
    },
    isDraft: {
        type: Boolean, 
        default: true, 
        index : true,
        select: false //k lấy giá trị doc.find() or doc.findOne()
    },
    isPublished: {
        type: Boolean, 
        default: false, 
        index : true,
        select: false //k lấy giá trị doc.find() or doc.findOne()
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME.PRODUCT
});
//Create index for search 
productSchema.index({product_name: 'text', product_description: 'text'})
//document middleware: runs before .save() and .create()..
productSchema.pre('save', function(next){
    this.product_slug = slugify(this.product_name,{lower: true})
    next()
})

//define the product type for clothing: 

const clothingSchema = new Schema({
    brand: { 
        type: String,
        required: true
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    size: String,
    material: String,
},{
    collection: COLLECTION_NAME.CLOTH,
    timestamps: true
})

//define the product type for electronic: 

const electronicSchema = new Schema({
    manufacturer: { 
        type: String,
        required: true
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    model: String,
    color: String,
},{
    collection: COLLECTION_NAME.ELECTRONIC,
    timestamps: true
})
const furnitureSchema = new Schema({
    brand: { 
        type: String,
        required: true
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    size: String,
    material: String,
},{
    collection: COLLECTION_NAME.FURNITURE,
    timestamps: true
})






//Export the model
module.exports = {
    product: model(DOCUMENT_NAME.PRODUCT, productSchema),
    clothing: model(DOCUMENT_NAME.CLOTH,clothingSchema),
    electronic: model(DOCUMENT_NAME.ELECTRONIC,electronicSchema),
    furniture: model(DOCUMENT_NAME.FURNITURE,furnitureSchema)
};