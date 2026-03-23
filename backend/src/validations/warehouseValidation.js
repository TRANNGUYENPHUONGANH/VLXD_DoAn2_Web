import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validator'

const validateUpdateWarehouse = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).trim(),
    address: Joi.string().trim().allow(null, ''),
    phone: Joi.string().trim().allow(null, ''),
    isActive: Joi.boolean()
  })

  return schema.validate(data, { abortEarly: false })
}

const validateImportProducts = (data) => {
  const schema = Joi.object({
    warehouseId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null, ''),
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
          quantity: Joi.number().integer().min(1).required(),
          price: Joi.number().min(0).default(0)
        })
      )
      .min(1)
      .required(),
    note: Joi.string().trim().allow('', null)
  })

  return schema.validate(data, { abortEarly: false })
}

const validateExportProducts = (data) => {
  const schema = Joi.object({
    warehouseId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null, ''),
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
          quantity: Joi.number().integer().min(1).required()
        })
      )
      .min(1)
      .required(),
    note: Joi.string().trim().allow('', null),
    orderId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null, '')
  })

  return schema.validate(data, { abortEarly: false })
}

export const warehouseValidation = {
  validateUpdateWarehouse,
  validateImportProducts,
  validateExportProducts
}
