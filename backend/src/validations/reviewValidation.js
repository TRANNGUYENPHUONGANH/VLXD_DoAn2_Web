import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

// Hàm helper để lấy giá trị từ req.body (xử lý cả array và string từ multer)
const getFieldValue = (field) => {
  if (Array.isArray(field)) {
    return field[0]
  }
  return field
}

const createNew = async (req, res, next) => {
  // Debug log để xem dữ liệu nhận được
  // console.log('=== DEBUG reviewValidation ===')
  // console.log('req.body:', req.body)
  // console.log('req.files:', req.files)
  // console.log('==============================')

  const schema = Joi.object({
    productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    orderId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'any.required': 'Chưa chọn số sao đánh giá',
      'number.min': 'Đánh giá tối thiểu là 1 sao',
      'number.max': 'Đánh giá tối đa là 5 sao'
    }),
    content: Joi.string().min(10).max(1000).required().trim().messages({
      'string.min': 'Nội dung đánh giá quá ngắn (tối thiểu 10 ký tự)',
      'string.max': 'Nội dung đánh giá quá dài (tối đa 1000 ký tự)',
      'any.required': 'Chưa nhập nội dung đánh giá'
    }),
    images: Joi.array().items(Joi.string().trim()).default([])
  })

  try {
    // Multer .fields() lưu các field dưới dạng array, cần chuyển về string
    // Và chuyển rating từ string sang number
    const bodyData = {
      productId: getFieldValue(req.body.productId),
      orderId: getFieldValue(req.body.orderId),
      rating: req.body.rating ? Number(getFieldValue(req.body.rating)) : undefined,
      content: getFieldValue(req.body.content),
      images: req.body.images || []
    }

    await schema.validateAsync(bodyData, { abortEarly: false })

    // Cập nhật req.body với dữ liệu đã xử lý để controller nhận đúng
    req.body = bodyData
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const reviewValidation = {
  createNew
}
