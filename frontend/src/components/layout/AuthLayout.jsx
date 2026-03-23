import { cn } from '~/lib/utils'
import { motion } from 'framer-motion'
import bg from '~/assets/bg/bg.jpg'

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  bannerImageUrl = bg,
  brandName = 'PA BUILD MATERIAL',
  brandTagline = 'Vật liệu xây dựng chất lượng cao'
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50/30 relative overflow-hidden">
      {/* Floating flower decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.15, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          className="absolute -bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full blur-3xl"
        />
      </div>

      <div className="relative min-h-screen">
        {/* Ambient light effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 left-12 h-[380px] w-[380px] rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 hidden h-[420px] w-[420px] rounded-full bg-muted/20 blur-3xl lg:block" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/40 bg-white/70 shadow-[0_18px_70px_-40px_rgba(0,0,0,0.25)] backdrop-blur-xl"
          >
            {/* Left side - Banner */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative hidden w-1/2 overflow-hidden lg:block"
              style={{ backgroundImage: `url('${bannerImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-slate-500/10" />

              {/* Decorative overlay pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />

              <div className="relative flex h-full flex-col items-center justify-center px-8 py-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-center text-white select-none"
                >
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-5 font-serif text-5xl font-semibold tracking-[0.35em] text-white/95 drop-shadow-lg"
                  >
                    {brandName}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-base font-light tracking-wide text-white/80"
                  >
                    {brandTagline}
                  </motion.p>
                </motion.div>

                {/* Decorative line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                />
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 sm:px-10 md:px-14"
            >
              <div className="w-full max-w-md">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-10 text-center lg:text-left"
                >
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={cn('font-serif text-3xl font-semibold text-gray-800', !subtitle && 'mb-0')}
                  >
                    {title}
                  </motion.h2>
                  {subtitle ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="mt-2 text-muted-foreground"
                    >
                      {subtitle}
                    </motion.p>
                  ) : null}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  {children}
                </motion.div>

                {footer ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-8"
                  >
                    {footer}
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

