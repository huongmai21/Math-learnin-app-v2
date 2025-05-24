import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import * as authService from "../../services/authService"
import { toast } from "react-toastify"

// Async thunks
export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials)
    // Lưu token vào localStorage
    localStorage.setItem("token", data.token)
    return data
  } catch (error) {
    return rejectWithValue(error.message || "Đăng nhập thất bại")
  }
})

export const register = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const data = await authService.register(userData)
    // Lưu token vào localStorage
    localStorage.setItem("token", data.token)
    return data
  } catch (error) {
    return rejectWithValue(error.message || "Đăng ký thất bại")
  }
})

export const refreshUser = createAsyncThunk("auth/refreshUser", async (_, { rejectWithValue }) => {
  try {
    const data = await authService.refreshUser()
    return data
  } catch (error) {
    console.error("refreshUser thunk error:", error)
    return rejectWithValue(error.message || "Không thể lấy thông tin người dùng")
  }
})

// Thêm updateUser thunk
export const updateUser = createAsyncThunk("auth/updateUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/users/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Không thể cập nhật thông tin người dùng")
    }

    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message || "Cập nhật thất bại")
  }
})

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token")
      state.user = null
      state.token = null
      state.isAuthenticated = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        toast.success("Đăng nhập thành công!")
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Đăng nhập thất bại")
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        toast.success("Đăng ký thành công!")
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Đăng ký thất bại")
      })
      // Refresh User
      .addCase(refreshUser.pending, (state) => {
        state.loading = true
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(refreshUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        // Chỉ hiển thị toast khi lỗi không phải do token hết hạn
        if (action.payload && !action.payload.includes("token")) {
          toast.error(action.payload || "Không thể lấy thông tin người dùng")
        }
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        toast.success("Cập nhật thông tin thành công!")
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload || "Cập nhật thất bại")
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
