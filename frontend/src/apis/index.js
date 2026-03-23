import { publicAxiosInstance, authorizeAxiosInstance } from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'


export const registerUserAPI = async (data) => {
  const response = await publicAxiosInstance.post(`${API_ROOT}/v1/users/register`, data)
  return response.data
}

export const verifyUserAPI = async (data) => {
  const response = await publicAxiosInstance.put(`${API_ROOT}/v1/users/verify`, data)
  return response.data
}

export const refreshTokenAPI = async () => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/users/refresh_token`)
  return response.data
}

export const loginUserAPI = async (data) => {
  const response = await publicAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
  return response.data
}

export const logoutUserAPI = async () => {
  // Dùng publicAxiosInstance vì khi gọi logout từ interceptor thì token có thể đã hết hạn
  const response = await publicAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)
  return response.data
}

// Dashboard API - cần auth
export const getDashboardAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/dashboard`)
  return response.data
}

// Category APIs - Public
export const getCategoriesAPI = async () => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/categories`)
  return response.data
}

export const getCategoryByIdAPI = async (id) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/categories/${id}`)
  return response.data
}

export const createCategoryAPI = async (data) => {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.description) formData.append('description', data.description)
  if (data.image) formData.append('image', data.image)

  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/categories`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateCategoryAPI = async (id, data) => {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.description) formData.append('description', data.description)
  if (data.image) formData.append('image', data.image)

  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/categories/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteCategoryAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/categories/${id}`)
  return response.data
}

// Product APIs
export const getProductsAdminAPI = async ({ page = 1, limit = 10, includeDeleted = false } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  if (!includeDeleted) {
    params.append('_destroy', 'false')
  }
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/products/admin?${params.toString()}`)
  return response.data
}

export const getProductByIdAPI = async (id) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/products/${id}`)
  return response.data
}

export const getProductsAPI = async ({ page = 1, limit = 12 } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/products?${params.toString()}`)
  return response.data
}

export const createProductAPI = async (data) => {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.categoryId) formData.append('categoryId', data.categoryId)
  if (data.price) formData.append('price', data.price)
  if (data.stockQuantity !== undefined) formData.append('stockQuantity', data.stockQuantity)
  if (data.unit) formData.append('unit', data.unit)
  if (data.description) formData.append('description', data.description)
  if (data.status) formData.append('status', data.status)
  if (data.origin) formData.append('origin', data.origin)
  if (data.brand) formData.append('brand', data.brand)
  if (data.warranty) formData.append('warranty', data.warranty)
  if (data.specifications) formData.append('specifications', data.specifications)

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('image', image)
    })
  }

  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/products/admin`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateProductAPI = async (id, data) => {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.categoryId) formData.append('categoryId', data.categoryId)
  if (data.price) formData.append('price', data.price)
  if (data.stockQuantity !== undefined) formData.append('stockQuantity', data.stockQuantity)
  if (data.unit) formData.append('unit', data.unit)
  if (data.description) formData.append('description', data.description)
  if (data.status) formData.append('status', data.status)
  if (data.origin) formData.append('origin', data.origin)
  if (data.brand) formData.append('brand', data.brand)
  if (data.warranty) formData.append('warranty', data.warranty)
  if (data.specifications) formData.append('specifications', data.specifications)

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('image', image)
    })
  }

  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteProductAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/products/${id}`)
  return response.data
}

export const restoreProductAPI = async (id) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/products/admin/${id}/restore`)
  return response.data
}

export const forceDeleteProductAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/products/admin/${id}/force`)
  return response.data
}

// User APIs
export const getUsersAPI = async ({ page = 1, limit = 10, role = 'ALL', isActive = 'ALL' } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  if (role && role !== 'ALL') params.append('role', role)
  if (isActive && isActive !== 'ALL') params.append('isActive', isActive)

  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/users?${params.toString()}`)
  return response.data
}

export const getUserByIdAPI = async (id) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/users/${id}`)
  return response.data
}

export const updateUserStatusAPI = async (id, data) => {
  const response = await authorizeAxiosInstance.patch(`${API_ROOT}/v1/users/${id}/status`, data)
  return response.data
}

export const changePasswordAPI = async (data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/users/change-password`, data)
  return response.data
}

export const updateUserProfileAPI = async (data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/users/update`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

// Coupon APIs
export const getCouponsAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/coupons`)
  return response.data
}

export const getValidCouponsAPI = async () => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/coupons/active`)
  return response.data
}

export const applyCouponAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/coupons/check`, data)
  return response.data
}

export const getCouponByIdAPI = async (id) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/coupons/${id}`)
  return response.data
}

export const createCouponAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/coupons`, data)
  return response.data
}

export const updateCouponAPI = async (id, data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/coupons/${id}`, data)
  return response.data
}

export const deleteCouponAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/coupons/${id}`)
  return response.data
}

// Order APIs
export const getOrdersAdminAPI = async ({ page = 1, limit = 10, status = 'ALL' } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  if (status && status !== 'ALL') params.append('status', status)

  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/orders/admin?${params.toString()}`)
  return response.data
}

export const getOrderByIdAPI = async (id) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/orders/${id}`)
  return response.data
}

export const updateOrderStatusAPI = async (id, status) => {
  const response = await authorizeAxiosInstance.patch(`${API_ROOT}/v1/orders/admin/${id}/status`, { status })
  return response.data
}

// Banner APIs
export const getBannersAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/banners`)
  return response.data
}

export const createBannerAPI = async (data) => {
  const formData = new FormData()
  if (data.title) formData.append('title', data.title)
  if (data.slug) formData.append('slug', data.slug)
  if (data.isActive !== undefined) formData.append('isActive', data.isActive)

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('image', image)
    })
  }

  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/banners`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateBannerAPI = async (id, data) => {
  const formData = new FormData()
  if (data.title) formData.append('title', data.title)
  if (data.slug) formData.append('slug', data.slug)
  if (data.isActive !== undefined) formData.append('isActive', data.isActive)

  if (data.images && data.images.length > 0) {
    data.images.forEach((image) => {
      formData.append('image', image)
    })
  }

  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/banners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteBannerAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/banners/${id}`)
  return response.data
}

// Article APIs
export const getArticlesAPI = async () => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/articles`)
  return response.data
}

export const getArticleByIdAPI = async (id) => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/articles/${id}`)
  return response.data
}

export const getArticlesAdminAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/articles`)
  return response.data
}

export const createArticleAPI = async (data) => {
  let formData
  if (data instanceof FormData) {
    formData = data
  } else {
    formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.slug) formData.append('slug', data.slug)
    if (data.summary) formData.append('summary', data.summary)
    if (data.content) formData.append('content', data.content)
    if (data.status) formData.append('status', data.status)
    if (data.image) formData.append('image', data.image)
  }

  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/articles`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateArticleAPI = async (id, data) => {
  let formData
  if (data instanceof FormData) {
    formData = data
  } else {
    formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.slug) formData.append('slug', data.slug)
    if (data.summary) formData.append('summary', data.summary)
    if (data.content) formData.append('content', data.content)
    if (data.status) formData.append('status', data.status)
    if (data.image) formData.append('image', data.image)
  }

  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/articles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteArticleAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/articles/${id}`)
  return response.data
}

// Contact APIs
export const createContactAPI = async (data) => {
  const response = await publicAxiosInstance.post(`${API_ROOT}/v1/contacts/public`, data)
  return response.data
}

export const getContactsAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/contacts`)
  return response.data
}

export const updateContactAPI = async (id, data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/contacts/${id}`, data)
  return response.data
}

export const deleteContactAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/contacts/${id}`)
  return response.data
}

// Review APIs
export const getReviewsAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/reviews/admin`)
  return response.data
}

export const getPublicReviewsAPI = async (limit = 6) => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/reviews/public?limit=${limit}`)
  return response.data
}

export const getReviewsByOrderIdAPI = async (orderId) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/reviews/order/${orderId}`)
  return response.data
}

export const getProductReviewsAPI = async (productId, page = 1, limit = 10) => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/reviews/product/${productId}?page=${page}&limit=${limit}`)
  return response.data
}

export const getReviewByIdAPI = async (id) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/reviews/admin/${id}`)
  return response.data
}

export const updateReviewAPI = async (id, data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/reviews/admin/${id}`, data)
  return response.data
}

export const deleteReviewAPI = async (id) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/reviews/admin/${id}`)
  return response.data
}

export const createReviewAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/reviews`, data)
  return response.data
}

// Cart APIs
export const getCartAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/carts`)
  return response.data
}

export const addToCartAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/carts/add`, data)
  return response.data
}

export const updateCartAPI = async (data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/carts/update`, data)
  return response.data
}

export const removeFromCartAPI = async (data) => {
  const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/carts/remove`, { data })
  return response.data
}

export const syncCartAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/carts/sync`, data)
  return response.data
}

export const createOrderAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/orders`, data)
  return response.data
}

export const getMyOrdersAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/orders/me`)
  return response.data
}

export const cancelOrderAPI = async (orderId) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/orders/${orderId}/cancel`)
  return response.data
}

export const getProvincesAPI = async () => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/locations/provinces`)
  return response.data
}

export const getDistrictsAPI = async (provinceCode) => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/locations/districts/${provinceCode}`)
  return response.data
}

export const getWardsAPI = async (districtCode) => {
  const response = await publicAxiosInstance.get(`${API_ROOT}/v1/locations/wards/${districtCode}`)
  return response.data
}

// ==================== Warehouse APIs ====================

export const getWarehouseAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/warehouses`)
  return response.data
}

export const getAllWarehousesAPI = async () => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/warehouses/all`)
  return response.data
}

export const updateWarehouseAPI = async (id, data) => {
  const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/warehouses/${id}`, data)
  return response.data
}

export const getWarehouseProductsAPI = async ({ warehouseId, page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  if (warehouseId) params.append('warehouseId', warehouseId)

  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/warehouses/products?${params.toString()}`)
  return response.data
}

export const getStockByProductAPI = async (productId) => {
  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/warehouses/stock/${productId}`)
  return response.data
}

export const importProductsAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/warehouses/import`, data)
  return response.data
}

export const exportProductsAPI = async (data) => {
  const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/warehouses/export`, data)
  return response.data
}

export const getWarehouseTransactionsAPI = async ({ warehouseId, type, page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams()
  params.append('page', page)
  params.append('limit', limit)
  if (warehouseId) params.append('warehouseId', warehouseId)
  if (type) params.append('type', type)

  const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/warehouses/transactions?${params.toString()}`)
  return response.data
}
