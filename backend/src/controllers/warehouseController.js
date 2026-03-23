import { StatusCodes } from 'http-status-codes'
import { warehouseService } from '~/services/warehouseService'
import { warehouseValidation } from '~/validations/warehouseValidation'

const getWarehouse = async (req, res, next) => {
  try {
    const warehouse = await warehouseService.getWarehouse()
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy thông tin kho thành công!',
      data: warehouse
    })
  } catch (error) {
    next(error)
  }
}

const getAllWarehouses = async (req, res, next) => {
  try {
    const warehouses = await warehouseService.getAllWarehouses()
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy danh sách kho thành công!',
      data: warehouses
    })
  } catch (error) {
    next(error)
  }
}

const updateWarehouse = async (req, res, next) => {
  try {
    const { error } = warehouseValidation.validateUpdateWarehouse(req.body)
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      })
    }

    const warehouseId = req.params.id
    const updated = await warehouseService.updateWarehouseInfo(warehouseId, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Cập nhật thông tin kho thành công!',
      data: updated
    })
  } catch (error) {
    next(error)
  }
}

const getWarehouseProducts = async (req, res, next) => {
  try {
    const { warehouseId, page, limit } = req.query

    const result = await warehouseService.getWarehouseProducts(
      warehouseId || null,
      page,
      limit
    )

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy danh sách sản phẩm trong kho thành công!',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

const getStockByProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId
    const stock = await warehouseService.getStockByProduct(productId)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy số lượng tồn kho thành công!',
      data: { productId, stock }
    })
  } catch (error) {
    next(error)
  }
}

const importProducts = async (req, res, next) => {
  try {
    const { error } = warehouseValidation.validateImportProducts(req.body)
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { warehouseId, products, note } = req.body
    const userId = req.user ? req.user._id : null

    const result = await warehouseService.importProducts(warehouseId, products, note, userId)

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: result.message,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

const exportProducts = async (req, res, next) => {
  try {
    const { error } = warehouseValidation.validateExportProducts(req.body)
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { warehouseId, products, note, orderId } = req.body
    const userId = req.user ? req.user._id : null

    const result = await warehouseService.exportProducts(warehouseId, products, note, userId, orderId)

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: result.message,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

const getTransactions = async (req, res, next) => {
  try {
    const { warehouseId, type, page, limit } = req.query

    const result = await warehouseService.getTransactions(
      warehouseId || null,
      type || null,
      page,
      limit
    )

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Lấy lịch sử giao dịch thành công!',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

export const warehouseController = {
  getWarehouse,
  getAllWarehouses,
  updateWarehouse,
  getWarehouseProducts,
  getStockByProduct,
  importProducts,
  exportProducts,
  getTransactions
}
