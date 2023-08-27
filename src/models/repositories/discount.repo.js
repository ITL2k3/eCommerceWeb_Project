'use strict'

const { ungetSelectData, getSelectData } = require("../../utils")
const discountModel = require("../discount.model")

const findAllDiscountCodesUnselect = async ({
    limit = 50, page = 1, sort = 'ctime',
    filter, unSelect, model
})=> {
    const skip = (page - 1)*limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id : 1}
    const documents = await model.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(ungetSelectData(unSelect))
    .lean()
    return documents
}

const findAllDiscountCodesSelect = async ({
    limit = 50, page = 1, sort = 'ctime',
    filter, select, model
})=> {
    const skip = (page - 1)*limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id : 1}
    const documents = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    return documents
}

const updateDiscountById = async ({
    discount_id,
    bodyUpdate,
    model,
    isNew = true
}) => {
    return await model.findByIdAndUpdate(discount_id,bodyUpdate,{
        new: isNew
    })
}
const checkDiscountExists = async ({filter}) => {
    return await discountModel.findOne(filter).lean()
}


module.exports = {
    findAllDiscountCodesUnselect,
    findAllDiscountCodesSelect,
    updateDiscountById,
    checkDiscountExists
}