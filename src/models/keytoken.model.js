'use strict'
const { Schema, model } = require('mongoose')

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'


var keyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Shop'
    },
    privateKey: {
        type: String,
        required: true

    },
    publicKey: {
        type: String,
        required: true,
    },
    refreshTokensUsed: {
        type: Array,
        default: [] //Used RT
    },
    refreshToken:{
        type: String,
        required: true
    }
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

module.exports = model(DOCUMENT_NAME, keyTokenSchema)