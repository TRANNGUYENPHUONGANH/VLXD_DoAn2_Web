import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const WAREHOUSE_COLLECTION_NAME = 'warehouses'
const WAREHOUSE_PRODUCT_COLLECTION_NAME = 'warehouse_products'
const WAREHOUSE_TRANSACTION_COLLECTION_NAME = 'warehouse_transactions'

const WAREHOUSE_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  address: Joi.string().trim().allow(null, ''),
  phone: Joi.string().trim().allow(null, ''),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const WAREHOUSE_PRODUCT_COLLECTION_SCHEMA = Joi.object({
  warehouseId: Joi.string().required(),
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(0).default(0),
  createdAt: Joi.date().timestamp('javascript').default(Date.now()),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const WAREHOUSE_TRANSACTION_COLLECTION_SCHEMA = Joi.object({
  warehouseId: Joi.string().required(),
  type: Joi.string().valid('IMPORT', 'EXPORT').required(),
  orderId: Joi.string().allow(null),
  products: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      productName: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).default(0)
    })
  ).required(),
  totalQuantity: Joi.number().integer().min(0).default(0),
  note: Joi.string().trim().allow(null, ''),
  createdBy: Joi.string().allow(null),
  createdAt: Joi.date().timestamp('javascript').default(Date.now())
})

// ==================== WAREHOUSE ====================

const validateBeforeCreateWarehouse = async (data) => {
  return await WAREHOUSE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createWarehouse = async (data) => {
  try {
    const validData = await validateBeforeCreateWarehouse(data)
    const newWarehouse = {
      ...validData,
      createdAt: Date.now(),
      updatedAt: null
    }
    const result = await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).insertOne(newWarehouse)
    return { ...newWarehouse, _id: result.insertedId }
  } catch (error) {
    throw new Error('Error creating warehouse: ' + error.message)
  }
}

const findWarehouseById = async (warehouseId) => {
  return await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).findOne({ _id: new ObjectId(String(warehouseId)) })
}

const findWarehouse = async () => {
  return await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).findOne({ isActive: true })
}

const getAllWarehouses = async () => {
  return await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).find().toArray()
}

const updateWarehouse = async (warehouseId, data) => {
  const result = await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(String(warehouseId)) },
    { $set: { ...data, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  return result
}

// ==================== WAREHOUSE PRODUCT ====================

const findWarehouseProduct = async (warehouseId, productId) => {
  return await GET_DB().collection(WAREHOUSE_PRODUCT_COLLECTION_NAME).findOne({
    warehouseId: new ObjectId(String(warehouseId)),
    productId: new ObjectId(String(productId))
  })
}

const findAllWarehouseProducts = async (warehouseId) => {
  return await GET_DB().collection(WAREHOUSE_PRODUCT_COLLECTION_NAME)
    .aggregate([
      { $match: { warehouseId: new ObjectId(String(warehouseId)) } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          productName: '$productInfo.name',
          productImage: { $arrayElemAt: ['$productInfo.images', 0] },
          productPrice: '$productInfo.price',
          productUnit: '$productInfo.unit'
        }
      }
    ])
    .toArray()
}

const createOrUpdateWarehouseProduct = async (warehouseId, productId, quantity, increment = false) => {
  const existing = await findWarehouseProduct(warehouseId, productId)

  if (existing) {
    const newQuantity = increment
      ? existing.quantity + quantity
      : Math.max(0, existing.quantity - quantity)

    const result = await GET_DB().collection(WAREHOUSE_PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { warehouseId: new ObjectId(String(warehouseId)), productId: new ObjectId(String(productId)) },
      { $set: { quantity: newQuantity, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } else {
    const newProduct = {
      warehouseId: new ObjectId(String(warehouseId)),
      productId: new ObjectId(String(productId)),
      quantity: quantity,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const result = await GET_DB().collection(WAREHOUSE_PRODUCT_COLLECTION_NAME).insertOne(newProduct)
    return { ...newProduct, _id: result.insertedId }
  }
}

const getStockByProductId = async (productId) => {
  const warehouse = await findWarehouse()
  if (!warehouse) return 0

  const product = await findWarehouseProduct(warehouse._id, productId)
  return product ? product.quantity : 0
}

// ==================== WAREHOUSE TRANSACTION ====================

const createTransaction = async (data) => {
  try {
    const validData = await WAREHOUSE_TRANSACTION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })

    const transaction = {
      ...validData,
      warehouseId: new ObjectId(String(validData.warehouseId)),
      orderId: validData.orderId ? new ObjectId(String(validData.orderId)) : null,
      createdBy: validData.createdBy ? new ObjectId(String(validData.createdBy)) : null,
      products: validData.products.map(p => ({
        ...p,
        productId: new ObjectId(String(p.productId))
      })),
      createdAt: Date.now()
    }

    const result = await GET_DB().collection(WAREHOUSE_TRANSACTION_COLLECTION_NAME).insertOne(transaction)
    return { ...transaction, _id: result.insertedId }
  } catch (error) {
    throw new Error('Error creating transaction: ' + error.message)
  }
}

const getTransactions = async (warehouseId, type, page, limit) => {
  const skip = (page - 1) * limit
  const query = {}

  if (warehouseId) {
    query.warehouseId = new ObjectId(String(warehouseId))
  }
  if (type) {
    query.type = type
  }

  const [transactions, total] = await Promise.all([
    GET_DB().collection(WAREHOUSE_TRANSACTION_COLLECTION_NAME)
      .aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'orders',
            localField: 'orderId',
            foreignField: '_id',
            as: 'orderInfo'
          }
        },
        { $unwind: { path: '$orderInfo', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            orderCode: '$orderInfo.orderCode'
          }
        }
      ])
      .toArray(),
    GET_DB().collection(WAREHOUSE_TRANSACTION_COLLECTION_NAME).countDocuments(query)
  ])

  return { transactions, total }
}

const getTransactionByOrderId = async (orderId) => {
  return await GET_DB().collection(WAREHOUSE_TRANSACTION_COLLECTION_NAME).findOne({
    orderId: new ObjectId(String(orderId))
  })
}

export const warehouseModel = {
  WAREHOUSE_COLLECTION_NAME,
  WAREHOUSE_PRODUCT_COLLECTION_NAME,
  WAREHOUSE_TRANSACTION_COLLECTION_NAME,

  createWarehouse,
  findWarehouseById,
  findWarehouse,
  getAllWarehouses,
  updateWarehouse,

  findWarehouseProduct,
  findAllWarehouseProducts,
  createOrUpdateWarehouseProduct,
  getStockByProductId,

  createTransaction,
  getTransactions,
  getTransactionByOrderId
}
