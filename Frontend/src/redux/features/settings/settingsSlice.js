import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getSchoolProfile,
  updateSchoolProfile,
} from "../../../services/schoolProfileService";

export const fetchSchoolProfileThunk = createAsyncThunk(
  "settings/fetchSchoolProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSchoolProfile();
      return response.data; // { success: true, data: {...} }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load school profile"
      );
    }
  }
);

export const updateSchoolProfileThunk = createAsyncThunk(
  "settings/updateSchoolProfile",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateSchoolProfile(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update school profile"
      );
    }
  }
);

const initialState = {
  schoolProfile: null,
  loading: false,
  error: null,
  successMessage: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearSettingsSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // school profile
      .addCase(fetchSchoolProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchoolProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolProfile = action.payload.data;
      })
      .addCase(fetchSchoolProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSchoolProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSchoolProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.schoolProfile = action.payload.data;
        state.successMessage = action.payload.message || "Profile updated successfully";
      })
      .addCase(updateSchoolProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSettingsError, clearSettingsSuccess } = settingsSlice.actions;
export default settingsSlice.reducer;
