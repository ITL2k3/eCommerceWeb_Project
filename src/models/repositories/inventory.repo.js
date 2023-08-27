

const {Types} = require('mongoose')
const {inventory} = require('../inventory.model')

const insertInventory = async({
    productId, shopId, stock, location = 'unKnown'
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    })
}

module.exports = {
    insertInventory
}