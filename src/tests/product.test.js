const redisPubsubService = require('../services/redis.Pubsub.service')
const RedisPubSubService = require('../services/redis.Pubsub.service')

class ProductServiceTest{
    purchaseProduct(productId, quantity){
        const order = {
            productId,
            quantity
        }
        redisPubsubService.publish('purchase_events', JSON.stringify(order))
    }
}

module.exports = new ProductServiceTest()