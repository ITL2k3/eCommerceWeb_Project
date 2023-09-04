'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.services")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData, createrandKey } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'

}

class AccessService {

    /*
        1. check this token used?
    */

    static handlerRefreshToken = async ({keyStore,user,refreshToken}) => {
        const {userId, email} = user
        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong had happened !!, Please relogin')
        }
        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered 01')
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureError('Shop not registered 02')
        //create new token
        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)
        //update token

        await KeyTokenService.update(keyStore._id,tokens,refreshToken)
        return {
            user: {userId, email},
            tokens
        }
        
        // //check token in RTUsed
        // const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
       
        // if(foundToken){
        //     //decode
        //     const {userId, email} = await verifyJWT(refreshToken,foundToken.privateKey)
        //     console.log({userId, email})
        //     //delete
            

        // }
        
        
        // //foundToken == null
        // const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        
        // if(!holderToken) throw new AuthFailureError('Shop not registered 01')
      
        // //verify Token
        // const {userId, email} = await verifyJWT(refreshToken,holderToken.privateKey)
        // console.log('2--',{userId, email})
        // //check userId
        // const foundShop = await findByEmail({email})
        // if(!foundShop) throw new AuthFailureError('Shop not registered 02')
        // //create new token
        // const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)
        // //update token

        // await KeyTokenService.update(holderToken._id,tokens,refreshToken)
        // return {
        //     user: {userId, email},
        //     tokens
        // }





    }

    static logout = async (keyStore) => {
        console.log(keyStore)
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey

    }

    /*
        1. check email in dbs
        2. match password
        3. create AT vs RT and save 
        4. generate tokens 
        5. get data return login 
    */
    static login = async({email, password, refreshToken = null}) => {
        //1
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registered!')
        // console.log('foundshop:', foundShop)
        //2
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error!')
        //3
        //create privatekey and publickey
        const {privateKey, publicKey} = createrandKey();
        //4
        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,

        })

        return {
            shop: getInfoData({ fields: ['_id', 'email'], object: foundShop }),
            tokens
            
        }



        

    }

    static signUp = async({ name, email, password }) => {
       
        
            //step1: check email existed?
            const holderShop = await shopModel.findOne({ email }).lean() //lean: tra ve obj js thuan tuy
           
            if (holderShop) {
                throw new BadRequestError('Error: Shop already registered!')
            }
           
            const passwordHash = await bcrypt.hash(password, 10)
            
            const newShop = await shopModel.create({
                name,
                email,
                password: passwordHash,
                roles: [RoleShop.SHOP]
            })
           
            if (newShop) {
                const {privateKey, publicKey} = createrandKey();
                
                    //save publickey to database 
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey

                })
                
                
                if (!keyStore) {
                    throw new BadRequestError('Error: Key not found!')

                }


                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
                
                    // console.log(`Created Token success::`, tokens)
                    
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({ fields: ['_id', 'email'], object: newShop }),
                        tokens
                    }
                }


            }


        
    }
}
module.exports = AccessService