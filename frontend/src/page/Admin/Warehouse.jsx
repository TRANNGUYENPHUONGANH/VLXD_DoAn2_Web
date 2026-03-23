import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Loader2,
  X,
  Upload,
  Download,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Edit,
  Save
} from 'lucide-react'
import {
  getWarehouseAPI,
  getWarehouseProductsAPI,
  getWarehouseTransactionsAPI,
  importProductsAPI,
  exportProductsAPI,
  getProductsAdminAPI,
  updateWarehouseAPI
} from '~/apis'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table'

const TABS = {
  PRODUCTS: 'products',
  IMPORT: 'import',
  EXPORT: 'export',
  TRANSACTIONS: 'transactions'
}

const TransactionTypeConfig = {
  IMPORT: {
    label: 'Nhập kho',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: ArrowDownLeft
  },
  EXPORT: {
    label: 'Xuất kho',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: ArrowUpRight
  }
}

export default function Warehouse() {
  const [activeTab, setActiveTab] = useState(TABS.PRODUCTS)
  const [loading, setLoading] = useState(false)
  const [warehouse, setWarehouse] = useState(null)
  const [products, setProducts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [allProducts, setAllProducts] = useState([])

  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Modals
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showEditWarehouseModal, setShowEditWarehouseModal] = useState(false)
  const [editWarehouseForm, setEditWarehouseForm] = useState({
    name: '',
    address: '',
    phone: ''
  })

  // Import/Export form
  const [importForm, setImportForm] = useState([
    { productId: '', quantity: 1 }
  ])
  const [exportForm, setExportForm] = useState([
    { productId: '', quantity: 1 }
  ])

  // Search
  const [searchProduct, setSearchProduct] = useState('')

  useEffect(() => {
    fetchWarehouse()
    fetchWarehouseProducts()
  }, [])

  useEffect(() => {
    if (activeTab === TABS.TRANSACTIONS) {
      fetchTransactions()
    }
  }, [activeTab, page])

  const fetchWarehouse = async () => {
    try {
      const response = await getWarehouseAPI()
      console.log(response)
      if (response.success) {
        setWarehouse(response.data)
        setEditWarehouseForm({
          name: response.data?.name || '',
          address: response.data?.address || '',
          phone: response.data?.phone || ''
        })
      }
    } catch (error) {
      console.error('Error fetching warehouse:', error)
    }
  }

  const fetchWarehouseProducts = async () => {
    try {
      setLoading(true)
      const response = await getWarehouseProductsAPI({ limit: 100 })
      if (response.success) {
        setProducts(response.data.products || [])
      }
    } catch (error) {
      console.error('Error fetching warehouse products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await getWarehouseTransactionsAPI({
        page,
        limit
      })
      if (response.success) {
        setTransactions(response.data.transactions || [])
        setTotalTransactions(response.data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const response = await getProductsAdminAPI({ page: 1, limit: 100 })
      if (response.success) {
        console.log(response)
        setAllProducts(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleOpenImport = async () => {
    await fetchAllProducts()
    setImportForm([{ productId: '', quantity: 1 }])
    setShowImportModal(true)
  }

  const handleOpenExport = async () => {
    await fetchAllProducts()
    setExportForm([{ productId: '', quantity: 1 }])
    setShowExportModal(true)
  }

  const handleAddImportRow = () => {
    setImportForm([...importForm, { productId: '', quantity: 1 }])
  }

  const handleRemoveImportRow = (index) => {
    setImportForm(importForm.filter((_, i) => i !== index))
  }

  const handleImportChange = (index, field, value) => {
    const newForm = [...importForm]
    newForm[index][field] = value
    setImportForm(newForm)
  }

  const handleAddExportRow = () => {
    setExportForm([...exportForm, { productId: '', quantity: 1 }])
  }

  const handleRemoveExportRow = (index) => {
    setExportForm(exportForm.filter((_, i) => i !== index))
  }

  const handleExportChange = (index, field, value) => {
    const newForm = [...exportForm]
    newForm[index][field] = value
    setExportForm(newForm)
  }

  const handleImport = async () => {
    try {
      const validProducts = importForm.filter(p => p.productId && p.quantity > 0)
      if (validProducts.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      setLoading(true)
      const response = await importProductsAPI({
        warehouseId: warehouse?._id,
        products: validProducts
      })

      if (response.success) {
        toast.success('Nhập kho thành công!')
        setShowImportModal(false)
        fetchWarehouseProducts()
        setActiveTab(TABS.TRANSACTIONS)
        fetchTransactions()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const validProducts = exportForm.filter(p => p.productId && p.quantity > 0)
      if (validProducts.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      setLoading(true)
      const response = await exportProductsAPI({
        warehouseId: warehouse?._id,
        products: validProducts
      })

      if (response.success) {
        toast.success('Xuất kho thành công!')
        setShowExportModal(false)
        fetchWarehouseProducts()
        setActiveTab(TABS.TRANSACTIONS)
        fetchTransactions()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateWarehouse = async () => {
    try {
      setLoading(true)
      const response = await updateWarehouseAPI(warehouse._id, editWarehouseForm)
      if (response.success) {
        toast.success('Cập nhật thông tin kho thành công!')
        setShowEditWarehouseModal(false)
        fetchWarehouse()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.productName?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const totalPages = Math.ceil(totalTransactions / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Quản lý kho hàng</h2>
          <p className="text-sm text-gray-500 mt-1">
            {warehouse?.name || 'Chưa có thông tin kho'}
            {warehouse?.address && ` - ${warehouse.address}`}
          </p>
        </div>
        <Button
          onClick={() => setShowEditWarehouseModal(true)}
          variant="outline"
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          Sửa thông tin kho
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tổng tồn kho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.reduce((sum, p) => sum + (p.quantity || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Giao dịch hôm nay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => {
                const today = new Date().toDateString()
                return new Date(t.createdAt).toDateString() === today
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab(TABS.PRODUCTS)}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === TABS.PRODUCTS
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <Package className="w-4 h-4 inline-block mr-2" />
          Sản phẩm trong kho
        </button>
        <button
          onClick={() => { setActiveTab(TABS.IMPORT); handleOpenImport() }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === TABS.IMPORT
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <Upload className="w-4 h-4 inline-block mr-2" />
          Nhập kho
        </button>
        <button
          onClick={() => { setActiveTab(TABS.EXPORT); handleOpenExport() }}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === TABS.EXPORT
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          <Download className="w-4 h-4 inline-block mr-2" />
          Xuất kho
        </button>
        <button
          onClick={() => setActiveTab(TABS.TRANSACTIONS)}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === TABS.TRANSACTIONS
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Lịch sử giao dịch
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === TABS.PRODUCTS && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Hình ảnh</TableHead>
                  <TableHead className="text-right">Số lượng tồn</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không có sản phẩm nào trong kho
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product, index) => (
                    <TableRow key={product._id || index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-800">{product.productName}</div>
                        <div className="text-xs text-gray-500">{product.productUnit || 'Đơn vị'}</div>
                      </TableCell>
                      <TableCell>
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {product.quantity || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.productPrice?.toLocaleString('vi-VN')} đ
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        {((product.quantity || 0) * (product.productPrice || 0)).toLocaleString('vi-VN')} đ
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === TABS.TRANSACTIONS && (
        <div className="space-y-4">
          {/* Transactions Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Chưa có giao dịch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction, index) => (
                    <TableRow key={transaction._id || index}>
                      <TableCell className="font-medium">{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>
                        <Badge className={TransactionTypeConfig[transaction.type]?.color || 'bg-gray-100'}>
                          {TransactionTypeConfig[transaction.type]?.label || transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {transaction.products?.map((product, i) => (
                            <div key={i} className="text-sm">
                              {product.productName} x {product.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.totalQuantity || transaction.products?.reduce((sum, p) => sum + p.quantity, 0) || 0}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {transaction.note || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Trang {page} / {totalPages} ({totalTransactions} giao dịch)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nhập kho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {importForm.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Sản phẩm</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => handleImportChange(index, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.map(product => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleImportChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                {importForm.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveImportRow(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddImportRow}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleImport} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Nhập kho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xuất kho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {exportForm.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Sản phẩm</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => handleExportChange(index, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.map(product => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name} (Tồn: {products.find(p => p.productId === product._id)?.quantity || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleExportChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                {exportForm.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExportRow(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={handleAddExportRow}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleExport} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xuất kho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Warehouse Modal */}
      <Dialog open={showEditWarehouseModal} onOpenChange={setShowEditWarehouseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thông tin kho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên kho</Label>
              <Input
                value={editWarehouseForm.name}
                onChange={(e) => setEditWarehouseForm({ ...editWarehouseForm, name: e.target.value })}
                placeholder="VD: Kho chính"
              />
            </div>
            <div>
              <Label>Địa chỉ</Label>
              <Input
                value={editWarehouseForm.address}
                onChange={(e) => setEditWarehouseForm({ ...editWarehouseForm, address: e.target.value })}
                placeholder="VD: 123 Đường ABC, Quận XYZ"
              />
            </div>
            <div>
              <Label>Điện thoại</Label>
              <Input
                value={editWarehouseForm.phone}
                onChange={(e) => setEditWarehouseForm({ ...editWarehouseForm, phone: e.target.value })}
                placeholder="VD: 0123456789"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditWarehouseModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateWarehouse} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
