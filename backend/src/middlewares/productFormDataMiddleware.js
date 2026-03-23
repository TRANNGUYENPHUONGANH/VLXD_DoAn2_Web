import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const transformFormData = (req, res, next) => {
  try {
    if (req.body.price) {
      req.body.price = Number(req.body.price)
    }

    if (req.body.stockQuantity) {
      req.body.stockQuantity = Number(req.body.stockQuantity)
    }

    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Dữ liệu không hợp lệ'))
  }
}

export const productFormDataMiddleware = { transformFormData }