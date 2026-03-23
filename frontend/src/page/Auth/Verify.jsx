import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react'
import { verifyUserAPI, registerUserAPI } from '~/apis'
import AuthLayout from '~/components/layout/AuthLayout'

export default function Verify() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (!email || !token) {
      setStatus('error')
      setMessage('Liên kết xác thực không hợp lệ.')
      return
    }

    const verifyAccount = async () => {
      try {
        await verifyUserAPI({ email, token })
        setStatus('success')
        setMessage('Tài khoản của bạn đã được xác thực thành công!')
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Xác thực thất bại. Liên kết có thể đã hết hạn.')
      }
    }

    verifyAccount()
  }, [email, token])

  const handleResendEmail = async () => {
    if (!email) return

    setResendLoading(true)
    try {
      await registerUserAPI({ email, password: '', phone: '' })
      setMessage('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể gửi lại email xác thực.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-4"
      >
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-gray-800 mb-2">
              Đang xác thực tài khoản...
            </h2>
            <p className="text-gray-500 text-sm">
              Vui lòng chờ trong giây lát
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-gray-800 mb-2">
              Xác thực tài khoản thành công!
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {message}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
            >
              Đăng nhập ngay
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-gray-800 mb-2">
              Xác thực thất bại
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {email && (
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-blue-500 text-blue-600 font-medium rounded-xl transition-all disabled:opacity-50"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Gửi lại email
                    </>
                  )}
                </button>
              )}
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Đăng nhập
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </AuthLayout>
  )
}
