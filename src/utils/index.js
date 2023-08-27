'use strict'

const _ = require('lodash')
const {Types} = require('mongoose')
const crypto = require('crypto')

const convertToObjectIdMongodb = id => Types.ObjectId(id)




const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields)

}
const createrandKey = () => {
    const privateKey = crypto.randomBytes(64).toString('hex')
    const publicKey = crypto.randomBytes(64).toString('hex')
    return {privateKey, publicKey}
}
const getSelectData  = (select = []) => {
    return Object.fromEntries(select.map(el=>[el,1]))
}
const ungetSelectData  = (select = []) => {
    return Object.fromEntries(select.map(el=>[el,0]))
}
const removeUndefinedObject = obj => {
    Object.keys(obj).forEach(k => {
        if(obj[k] == null){
            delete obj[k]
            
        }
        if(typeof obj[k] === 'object' && !Array.isArray(obj[k])){
            removeUndefinedObject(obj[k])
        }
    })
         
    return obj
}
const updateNestedObjectParser = obj =>{
    
    console.log(`[1]::`,obj)
    const final = {}
    Object.keys(obj).forEach(k => {
        console.log('[3]::',k)
        if(typeof obj[k] === 'object' && !Array.isArray(obj[k])){
            console.log('yes')
            // console.log('[3]::',k)
            const response = updateNestedObjectParser(obj[k])
            Object.keys(response).forEach(a => {
                final[`${k}.${a}`] = response[a]
            })

        }else{
            final[k] = obj[k]
        }
    })
    console.log(`[2]::`,final)
    return final
}

module.exports = {
    getInfoData,
    createrandKey,
    getSelectData,
    ungetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb
}