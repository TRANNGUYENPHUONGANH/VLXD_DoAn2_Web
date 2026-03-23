import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addToCartAPI, getCartAPI } from '~/apis'

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (cartItem, { rejectWithValue }) => {
    try {
      const response = await addToCartAPI({
        productId: cartItem.productId,
        quantity: cartItem.quantity
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart')
    }
  }
)

export const fetchCartAsync = createAsyncThunk(
  'cart/fetchCartAsync',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCartAPI()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart')
    }
  }
)

const initialState = {
  items: [], // { productId, name, price, image, quantity, stockQuantity }
  loading: false,
  error: null
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { productId, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      state.items = state.items.filter(
        (item) => item.productId !== productId
      );
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.productId === productId
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.items) {
          state.items = action.payload.items;
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.items) {
          state.items = action.payload.items;
        }
      })
      .addCase(fetchCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, clearError } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalCount = (state) => state.cart.items.length;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const cartReducer = cartSlice.reducer;
