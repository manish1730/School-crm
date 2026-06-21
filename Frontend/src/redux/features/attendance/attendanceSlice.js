import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStudentAttendance,
  saveStudentAttendance,
} from "../../../services/studentAttendanceService";

export const fetchStudentAttendanceThunk = createAsyncThunk(
  "attendance/fetchStudentAttendance",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getStudentAttendance(params);
      return response.data; // { success: true, data: { students: [], records: [], stats: {} } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load student attendance"
      );
    }
  }
);

export const saveStudentAttendanceThunk = createAsyncThunk(
  "attendance/saveStudentAttendance",
  async (data, { rejectWithValue }) => {
    try {
      const response = await saveStudentAttendance(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to save student attendance"
      );
    }
  }
);

const initialState = {
  students: [],
  records: [],
  stats: { totalStudents: 0, present: 0, absent: 0, leave: 0 },
  filters: {
    className: "",
    sectionName: "",
    date: new Date().toISOString().split("T")[0],
  },
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setAttendanceFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearAttendanceSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentAttendanceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttendanceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.data?.students || [];
        state.records = action.payload.data?.records || [];
        state.stats = action.payload.data?.stats || state.stats;
      })
      .addCase(fetchStudentAttendanceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveStudentAttendanceThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(saveStudentAttendanceThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.successMessage = action.payload.message;
      })
      .addCase(saveStudentAttendanceThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const {
  setAttendanceFilters,
  clearAttendanceError,
  clearAttendanceSuccess,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
