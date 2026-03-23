import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const transformFormData = (req, res, next) => {
  try {
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Dữ liệu FormData không hợp lệ'))
  }
}

export const articleFormDataMiddleware = { transformFormData }
