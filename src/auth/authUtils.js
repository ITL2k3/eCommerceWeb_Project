'use strict'
const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helper/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.services')
const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'refreshtoken'
}
const createTokenPair = async(payload, publickey, privateKey) => {
    try {
        //accessToken
        const accessToken = await JWT.sign(payload, publickey, {

            expiresIn: '2 days'
        })
        const refreshToken = await JWT.sign(payload, privateKey, {

            expiresIn: '7 days'
        })
        // JWT.verify(accessToken, publickey, (err, decode) => {
        //     if (err) {
        //         console.log(`error while verify:`, err)
        //     } else {
        //         console.log(`decode verify::`, decode)
        //     }
        // })
        return { accessToken, refreshToken }

    } catch (error) {
    }
}
const authentication = asyncHandler(async(req,res,next)=>{
    
    /*
        1. Check userId missing ?
        2. get accessToken 
        3. verify Token 
        4. check user in dbs
        5. check keyStore with userId
        6. return next()
    */
    //1
  
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request!!')
    //2
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('keyStore not found!!')
    //3
    if(req.headers[HEADER.REFRESHTOKEN]){
        try{
            const refreshToken = req.headers[HEADER.REFRESHTOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)
            if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid userId')
            req.keyStore = keyStore
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        }catch(error){
            throw error
        }
    }
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError('Invalid Request!!')
    try{
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid userId')
        req.keyStore = keyStore
        return next()
    }catch(error){
        throw error
    }

    


})
const verifyJWT = async (token, keySecret)=>{
    return await JWT.verify(token,keySecret)
}
module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}