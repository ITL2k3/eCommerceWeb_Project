'use strict'

const mongoose = require('mongoose')

const {db: {host, name , port}} = require('../configs/config.mongodb') 

const connectString = `mongodb://${host}:${port}/${name}`
const { countConnect} = require('../helper/check.connect') 



class Database{
    constructor(){
        this.connect()
    }
    connect(){
        if(1===1){
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }
        mongoose.connect(connectString,{
            maxPoolSize: 50
        }).then( _ => {
            console.log(`Connected Mongodb Success`, countConnect())
        })
        .catch( err => console.log(`Error Db Connect!`))
        
    }
    static getInstace(){
        if(!Database.instance){
            Database.instance = new Database()
        }
        return Database.instance
    }
}
const instanceMongodb = Database.getInstace()
module.exports = instanceMongodb