import express from 'express'
import axios from 'axios'

const Router = express.Router()

const PROVINCES_API = 'https://provinces.open-api.vn/api'

// Cache data to reduce API calls
let cachedProvinces = null
let cachedDistricts = {}
let cachedWards = {}
let lastFetchTime = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// Lấy danh sách tỉnh/thành phố
Router.get('/provinces', async (req, res) => {
  try {
    const now = Date.now()

    // Check cache
    if (cachedProvinces && (now - lastFetchTime) < CACHE_DURATION) {
      return res.json({
        success: true,
        data: cachedProvinces
      })
    }

    // Fetch from external API
    const response = await axios.get(`${PROVINCES_API}/?depth=1`, {
      timeout: 10000
    })

    // Transform data to match expected format
    const provinces = response.data.map(province => ({
      code: province.code,
      name: province.name,
      type: province.name.includes('Thành phố') ? 'thành phố' : 'tỉnh'
    }))

    // Update cache
    cachedProvinces = provinces
    lastFetchTime = now

    res.json({
      success: true,
      data: provinces
    })
  } catch (error) {
    console.error('Error fetching provinces:', error.message)
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tỉnh/thành phố'
    })
  }
})

// Lấy danh sách quận/huyện theo tỉnh
Router.get('/districts/:provinceCode', async (req, res) => {
  try {
    const { provinceCode } = req.params

    // Check cache
    if (cachedDistricts[provinceCode]) {
      return res.json({
        success: true,
        data: cachedDistricts[provinceCode]
      })
    }

    // Fetch from external API
    const response = await axios.get(`${PROVINCES_API}/p/${provinceCode}?depth=2`, {
      timeout: 10000
    })

    // Transform data
    const districts = (response.data.districts || []).map(district => ({
      code: district.code,
      name: district.name,
      province_code: provinceCode
    }))

    // Update cache
    cachedDistricts[provinceCode] = districts

    res.json({
      success: true,
      data: districts
    })
  } catch (error) {
    console.error('Error fetching districts:', error.message)
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách quận/huyện'
    })
  }
})

// Lấy danh sách phường/xã theo quận
Router.get('/wards/:districtCode', async (req, res) => {
  try {
    const { districtCode } = req.params

    // Check cache
    if (cachedWards[districtCode]) {
      return res.json({
        success: true,
        data: cachedWards[districtCode]
      })
    }

    // Fetch from external API
    const response = await axios.get(`${PROVINCES_API}/d/${districtCode}?depth=2`, {
      timeout: 10000
    })

    // Transform data
    const wards = (response.data.wards || []).map(ward => ({
      code: ward.code,
      name: ward.name,
      district_code: districtCode,
      province_code: response.data.province_code
    }))

    // Update cache
    cachedWards[districtCode] = wards

    res.json({
      success: true,
      data: wards
    })
  } catch (error) {
    console.error('Error fetching wards:', error.message)
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phường/xã'
    })
  }
})

export const locationRoute = Router
