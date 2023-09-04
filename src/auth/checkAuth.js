'use strict'

const { BadRequestError } = require("../core/error.response")
const { findById, newKey } = require("../services/apikey.service")

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}
const apiKey = async(req, res, next) => {
    // console.log('start')
    //     newKey()
    //     console.log('end')

        const key = req.headers[HEADER.API_KEY]?.toString()
        
        if (!key) {
            throw new BadRequestError('Error: apiKey not found !')
        }

        //check objKey
        const objKey = await findById(key)
        if (!objKey) {
            throw new BadRequestError('Forbidden Error !', 403)
            
        }
        req.objKey = objKey
        return next()


    

}
const permissions = (permission) => {
    return (req,res,next) => {
        if(!req.objKey.permissions){
            throw new BadRequestError('Permission code not found!',404)
            
        }
        console.log('permission::', req.objKey.permissions)
        const validPermission = req.objKey.permissions.includes(permission)
        if(!validPermission){
            throw new BadRequestError('Permission denied',403)
            
        }
      
        return next()

    }
}


module.exports = {
    apiKey,
    permissions,
    
}