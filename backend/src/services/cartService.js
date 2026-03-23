import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cartModel } from '~/models/cartModel'
import { productModel } from '~/models/productModel'

const getCart = async (userId) => {
  return await cartModel.getCartWithProductDetails(userId)
}

const addToCart = async (userId, payload) => {
  const { productId, quantity } = payload

  const product = await productModel.findOneById(productId)
  if (!product || product._destroy || product.status !== 'active') {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không khả dụng!')
  }

  let currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) {
    currentCart = await cartModel.createCart(userId)
  }

  let cartItems = [...currentCart.items]

  const itemIndex = cartItems.findIndex(i => i.productId.toString() === productId)

  if (itemIndex > -1) {
    const newQuantity = cartItems[itemIndex].quantity + quantity
    if (newQuantity > product.stockQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Số lượng vượt quá tồn kho. Chỉ còn lại ${product.stockQuantity} sản phẩm!`)
    }
    cartItems[itemIndex].quantity = newQuantity
  } else {
    if (quantity > product.stockQuantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Số lượng vượt quá tồn kho. Chỉ còn lại ${product.stockQuantity} sản phẩm!`)
    }
    cartItems.push({ productId, quantity })
  }

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

const updateCartItemQuantity = async (userId, payload) => {
  const { productId, quantity } = payload

  const product = await productModel.findOneById(productId)
  if (!product) throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không khả dụng!')

  if (quantity > product.stockQuantity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Số lượng yêu cầu vượt quá tồn kho (${product.stockQuantity})!`)
  }

  const currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) throw new ApiError(StatusCodes.NOT_FOUND, 'Giỏ hàng không tồn tại')

  const cartItems = currentCart.items.map(item => {
    if (item.productId.toString() === productId) {
      return { ...item, quantity }
    }
    return item
  })

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

const removeFromCart = async (userId, payload) => {
  const { productId } = payload

  const currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) return null

  const cartItems = currentCart.items.filter(
    item => item.productId.toString() !== productId
  )

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

const syncCart = async (userId, payload) => {
  const { items } = payload

  let currentCart = await cartModel.findByUserId(userId)
  if (!currentCart) {
    currentCart = await cartModel.createCart(userId)
  }

  const cartItems = [...currentCart.items]

  for (const item of items) {
    const { productId, quantity } = item

    // Validate product exists and is active
    const product = await productModel.findOneById(productId)
    if (!product || product._destroy || product.status !== 'active') {
      continue
    }

    // Check stock
    const maxQuantity = product.stockQuantity
    if (quantity > maxQuantity) {
      continue
    }

    const itemIndex = cartItems.findIndex(
      i => i.productId.toString() === productId
    )

    if (itemIndex > -1) {
      // Update quantity (keep the higher quantity)
      const newQuantity = Math.max(cartItems[itemIndex].quantity, quantity)
      if (newQuantity <= maxQuantity) {
        cartItems[itemIndex].quantity = newQuantity
      }
    } else {
      cartItems.push({ productId, quantity: Math.min(quantity, maxQuantity) })
    }
  }

  await cartModel.updateCartItems(userId, cartItems)
  return await getCart(userId)
}

export const cartService = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  syncCart
}