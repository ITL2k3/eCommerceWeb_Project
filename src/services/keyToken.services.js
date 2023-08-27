'use strict'

const keytokenModel = require("../models/keytoken.model")
const {Types} = require('mongoose')

class KeyTokenService {
    static createKeyToken = async({ userId, publicKey, privateKey,refreshToken }) => {
        try {
            // lvl 0
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            
            // return tokens ? tokens.publicKey : null
            //level xxx
            console.log('userId: ', userId)
            const filter = {user : userId}, update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }, options = {upsert: true, new: true}
            const tokens = await keytokenModel.findOneAndUpdate(filter,update,options)
            return tokens ? tokens.publicKey : null

        } catch (error) {
            return error
        }
    }
    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({user: new Types.ObjectId(userId)}).lean()
    }
    static removeKeyById = async(id) => {
        return await keytokenModel.findOneAndDelete({_id: new Types.ObjectId(id)}).lean()
    }
    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({refreshTokensUsed: refreshToken}).lean()
    }
    static findByRefreshToken= async (refreshToken) => {
        return await keytokenModel.findOne({refreshToken}).lean()
    }

    static update = async(id,tokens,usedRT) => {
        return await keytokenModel.findOneAndUpdate({_id: new Types.ObjectId(id)},{
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: usedRT
            }
        })

    }

    static deleteKeyById = async(userId) => {
        return await keytokenModel.findOneAndDelete({user: new Types.ObjectId(userId)}).lean()
    }
    
}

module.exports = KeyTokenService