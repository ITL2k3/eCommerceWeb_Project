'use strict'

const { model, Schema } = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'

// Declare the Schema of the Mongo model
var discountSchema = new Schema({
    discount_name: {
        type: String,
        required: true
    },
    discount_description:{
        type: String,
        required: true
    },
    discount_types: {
        type: String,
        default: 'fixed_amount'//percentage
    },
    discount_value: {//10000, 10
        type: Number,
        required:true
    },
    discount_code: {//discount code
        type: String,
        required: true
    },
    discount_start_date:{//ngay bat dau
        type: Date,
        required: true
    },
    discount_end_date:{//ngay ket thuc
        type: Date,
        required: true
    },
    discount_max_uses: {//soluong discount dc ap dung
        type: Number,
        required: true
    },
    discount_uses_count:{// so discount da su dung
        type: Number,
        required: true
    },
    discount_users_used:{//ai da su dung
        type: Array,
        default: []
    },
    discount_max_uses_per_user: {// so luong cho phep toi da duoc su dung moi user
        type: Number,
        required: true
    },
    discount_min_order_value: {
        type: Number,
        required: true
    },
    discount_max_value: {
        type: Number,
        required: true
    },
    discount_shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    discount_is_active:{
        type: Boolean,
        default: true
    },
    discount_applies_to:{
        type: String,
        required: true,
        enum: ['all','specific']
    },
    discount_product_ids: {//so san pham duoc ap dung
        type: Array,
        default: []
    }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);