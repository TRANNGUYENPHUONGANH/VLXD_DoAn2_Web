import express from 'express'
import { warehouseController } from '~/controllers/warehouseController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.get('/', authMiddleware.isAuthorizedAdmin, warehouseController.getWarehouse)

router.get('/all', authMiddleware.isAuthorizedAdmin, warehouseController.getAllWarehouses)

router.put('/:id', authMiddleware.isAuthorizedAdmin, warehouseController.updateWarehouse)


router.get('/products', authMiddleware.isAuthorized, warehouseController.getWarehouseProducts)

router.get('/stock/:productId', authMiddleware.isAuthorizedAdmin, warehouseController.getStockByProduct)

router.post('/import', authMiddleware.isAuthorizedAdmin, warehouseController.importProducts)

router.post('/export', authMiddleware.isAuthorizedAdmin, warehouseController.exportProducts)

router.get('/transactions', authMiddleware.isAuthorizedAdmin, warehouseController.getTransactions)

export const warehouseRoute = router
