import { warehouseModel } from '~/models/warehouseModel'
import { productModel } from '~/models/productModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { DEFAULT_PAGE, DEFAULT_ITEM_PER_PAGE } from '~/utils/constants'

const getWarehouse = async () => {
  try {
    let warehouse = await warehouseModel.findWarehouse()

    if (!warehouse) {
      warehouse = await warehouseModel.createWarehouse({
        name: 'Kho chính PA Material',
        address: 'Địa chỉ kho',
        phone: null,
        isActive: true
      })
    }

    return warehouse
  } catch (error) {
    throw error
  }
}

const getAllWarehouses = async () => {
  try {
    return await warehouseModel.getAllWarehouses()
  } catch (error) {
    throw error
  }
}

const updateWarehouseInfo = async (warehouseId, data) => {
  try {
    const warehouse = await warehouseModel.findWarehouseById(warehouseId)
    if (!warehouse) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy kho!')
    }

    const updated = await warehouseModel.updateWarehouse(warehouseId, data)
    return updated
  } catch (error) {
    throw error
  }
}

const getWarehouseProducts = async (warehouseId, page = DEFAULT_PAGE, limit = DEFAULT_ITEM_PER_PAGE) => {
  try {
    let warehouse = await getWarehouse()
    const warehouseIdToUse = warehouseId || warehouse._id.toString()

    // Lấy tất cả sản phẩm từ products collection
    const allProducts = await productModel.getAdminProducts()

    // Lấy tất cả sản phẩm trong warehouse_products
    const warehouseProducts = await warehouseModel.findAllWarehouseProducts(warehouseIdToUse)

    // Map sản phẩm với số lượng tồn kho
    const productsWithStock = allProducts.map(product => {
      const wp = warehouseProducts.find(wp => {
        const wpProductId = wp.productId?.toString()
        const prodId = product._id?.toString()
        return wpProductId === prodId
      })
      return {
        _id: product._id,
        productId: product._id,
        productName: product.name,
        productImage: product.images?.[0] || null,
        productPrice: product.price || 0,
        productUnit: product.unit || 'Cái',
        quantity: wp?.quantity || 0
      }
    })

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedProducts = productsWithStock.slice(skip, skip + parseInt(limit))

    return {
      products: paginatedProducts,
      pagination: {
        totalRecords: productsWithStock.length,
        totalPages: Math.ceil(productsWithStock.length / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    }
  } catch (error) {
    throw error
  }
}

const getStockByProduct = async (productId) => {
  try {
    const stock = await warehouseModel.getStockByProductId(productId)
    return stock
  } catch (error) {
    throw error
  }
}

const importProducts = async (warehouseId, products, note, userId) => {
  try {
    let warehouse = await getWarehouse()
    const warehouseIdToUse = warehouseId || warehouse._id.toString()

    const transactionProducts = []
    let totalQuantity = 0

    for (const item of products) {
      const product = await productModel.findOneById(item.productId)
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Sản phẩm với ID ${item.productId} không tồn tại!`)
      }

      await warehouseModel.createOrUpdateWarehouseProduct(
        warehouseIdToUse,
        item.productId,
        item.quantity,
        true
      )

      // Cập nhật số lượng tồn kho trong sản phẩm (cộng thêm)
      await productModel.updateProductStock(item.productId, -item.quantity)

      transactionProducts.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: item.price || 0
      })

      totalQuantity += item.quantity
    }

    await warehouseModel.createTransaction({
      warehouseId: warehouseIdToUse,
      type: 'IMPORT',
      orderId: null,
      products: transactionProducts,
      totalQuantity: totalQuantity,
      note: note || '',
      createdBy: userId
    })

    return { success: true, message: 'Nhập hàng thành công!' }
  } catch (error) {
    throw error
  }
}

const exportProducts = async (warehouseId, products, note, userId, orderId = null) => {
  try {
    let warehouse = await getWarehouse()
    const warehouseIdToUse = warehouseId || warehouse._id.toString()

    const transactionProducts = []
    let totalQuantity = 0

    for (const item of products) {
      const product = await productModel.findOneById(item.productId)
      if (!product) {
        throw new ApiError(StatusCodes.NOT_FOUND, `Sản phẩm với ID ${item.productId} không tồn tại!`)
      }

      const currentStock = product.stockQuantity || 0
      if (currentStock < item.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Sản phẩm "${product.name}" không đủ tồn kho! (Yêu cầu: ${item.quantity}, Có: ${currentStock})`
        )
      }

      await warehouseModel.createOrUpdateWarehouseProduct(
        warehouseIdToUse,
        item.productId,
        item.quantity,
        false
      )

      // Cập nhật số lượng tồn kho trong sản phẩm (trừ đi)
      await productModel.updateProductStock(item.productId, item.quantity)

      transactionProducts.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: 0
      })

      totalQuantity += item.quantity
    }

    await warehouseModel.createTransaction({
      warehouseId: warehouseIdToUse,
      type: 'EXPORT',
      orderId: orderId,
      products: transactionProducts,
      totalQuantity: totalQuantity,
      note: note || '',
      createdBy: userId
    })

    return { success: true, message: 'Xuất hàng thành công!' }
  } catch (error) {
    throw error
  }
}

const getTransactions = async (warehouseId, type, page = DEFAULT_PAGE, limit = DEFAULT_ITEM_PER_PAGE) => {
  try {
    let warehouse = await getWarehouse()
    const warehouseIdToUse = warehouseId || warehouse._id.toString()

    const result = await warehouseModel.getTransactions(
      warehouseIdToUse,
      type,
      parseInt(page),
      parseInt(limit)
    )

    return {
      transactions: result.transactions,
      pagination: {
        totalRecords: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    }
  } catch (error) {
    throw error
  }
}

const getTransactionByOrder = async (orderId) => {
  try {
    const transaction = await warehouseModel.getTransactionByOrderId(orderId)
    return transaction
  } catch (error) {
    throw error
  }
}

export const warehouseService = {
  getWarehouse,
  getAllWarehouses,
  updateWarehouseInfo,
  getWarehouseProducts,
  getStockByProduct,
  importProducts,
  exportProducts,
  getTransactions,
  getTransactionByOrder
}
