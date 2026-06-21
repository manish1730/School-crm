import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "../../../services/authservice";

export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const data = await loginUser(loginData);
      // Save to localStorage on success
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to login"
      );
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
);

const initialState = {
  token: localStorage.getItem("token") || null,
  user: (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })(),
  loading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.successMessage = action.payload.message || "Login successful";
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
        state.successMessage = null;
      });
  },
});

export const { clearAuthError, clearSuccessMessage } = authSlice.actions;
export default authSlice.reducer;
