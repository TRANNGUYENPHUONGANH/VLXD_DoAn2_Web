import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wishlist')
    if (saved) {
      setWishlist(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.productId === product.productId)) {
        return prev
      }
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId))
  }

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.productId === productId)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
