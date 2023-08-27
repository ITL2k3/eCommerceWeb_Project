'use strict'

const apikeyModel = require("../models/apikey.model")
const crypto = require('crypto')

const findById = async(key) => {
    const objKey = await apikeyModel.findOne({ key, status: true }).lean()
    return objKey
}
const newKey = async () => {
    const newKey = await apikeyModel.create({key: crypto.randomBytes(64).toString('hex'),permissions:['0000']})
    console.log('apiKey created success::', newKey)
}
module.exports = {
    findById,
    newKey
}