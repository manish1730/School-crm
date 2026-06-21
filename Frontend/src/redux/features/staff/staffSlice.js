import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffAttendance,
  markStaffAttendance,
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
  getPayroll,
  generatePayroll,
} from "../../../services/staffService";

// Staff Crud Thunks
export const fetchStaffThunk = createAsyncThunk(
  "staff/fetchStaff",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getStaff(params);
      return response.data; // { success: true, data: [...] }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load staff"
      );
    }
  }
);

export const createStaffThunk = createAsyncThunk(
  "staff/createStaff",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createStaff(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create staff"
      );
    }
  }
);

export const updateStaffThunk = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateStaff(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update staff"
      );
    }
  }
);

export const deleteStaffThunk = createAsyncThunk(
  "staff/deleteStaff",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteStaff(id);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete staff"
      );
    }
  }
);

// Payroll Thunks
export const fetchPayrollThunk = createAsyncThunk(
  "staff/fetchPayroll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPayroll();
      return response.data; // { success: true, data: { payroll: [], stats: {} } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load payroll"
      );
    }
  }
);

export const generatePayrollThunk = createAsyncThunk(
  "staff/generatePayroll",
  async (data, { rejectWithValue }) => {
    try {
      const response = await generatePayroll(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to generate payroll"
      );
    }
  }
);

// Leave Thunks
export const fetchLeaveRequestsThunk = createAsyncThunk(
  "staff/fetchLeaveRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getLeaveRequests();
      return response.data; // { success: true, data: { leaves: [], stats: {} } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load leaves"
      );
    }
  }
);

export const createLeaveRequestThunk = createAsyncThunk(
  "staff/createLeaveRequest",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createLeaveRequest(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to submit leave request"
      );
    }
  }
);

export const updateLeaveStatusThunk = createAsyncThunk(
  "staff/updateLeaveStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await updateLeaveStatus(id, status);
      return { id, status, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update leave status"
      );
    }
  }
);

// Staff Attendance Thunks
export const fetchStaffAttendanceThunk = createAsyncThunk(
  "staff/fetchStaffAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getStaffAttendance(params);
      return response.data; // { success: true, data: { staff: [], records: [], stats: {} } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load staff attendance"
      );
    }
  }
);

export const markStaffAttendanceThunk = createAsyncThunk(
  "staff/markStaffAttendance",
  async (data, { rejectWithValue }) => {
    try {
      const response = await markStaffAttendance(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to mark staff attendance"
      );
    }
  }
);

const initialState = {
  list: [],
  payroll: [],
  payrollStats: { totalPayroll: 0, paid: 0, pending: 0, processing: 0 },
  leaves: [],
  leaveStats: { total: 0, approved: 0, pending: 0, rejected: 0 },
  attendanceStaff: [],
  attendanceRecords: [],
  attendanceStats: { totalStaff: 0, present: 0, absent: 0, onLeave: 0 },
  loading: false,
  error: null,
  successMessage: null,
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearStaffError: (state) => {
      state.error = null;
    },
    clearStaffSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch staff
      .addCase(fetchStaffThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
      })
      .addCase(fetchStaffThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // save staff (create/update)
      .addCase(createStaffThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createStaffThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createStaffThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStaffThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateStaffThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(updateStaffThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // delete staff
      .addCase(deleteStaffThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteStaffThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((item) => item._id !== action.payload.id);
        state.successMessage = action.payload.message;
      })
      .addCase(deleteStaffThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // payroll
      .addCase(fetchPayrollThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.payroll = action.payload.data?.payroll || [];
        state.payrollStats = action.payload.data?.stats || state.payrollStats;
      })
      .addCase(fetchPayrollThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generatePayrollThunk.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(generatePayrollThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      // leaves
      .addCase(fetchLeaveRequestsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveRequestsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload.data?.leaves || [];
        state.leaveStats = action.payload.data?.stats || state.leaveStats;
      })
      .addCase(fetchLeaveRequestsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLeaveRequestThunk.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(createLeaveRequestThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateLeaveStatusThunk.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(updateLeaveStatusThunk.rejected, (state, action) => {
        state.error = action.payload;
      })
      // staff attendance
      .addCase(fetchStaffAttendanceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffAttendanceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceStaff = action.payload.data?.staff || [];
        state.attendanceRecords = action.payload.data?.records || [];
        state.attendanceStats = action.payload.data?.stats || state.attendanceStats;
      })
      .addCase(fetchStaffAttendanceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markStaffAttendanceThunk.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(markStaffAttendanceThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearStaffError, clearStaffSuccess } = staffSlice.actions;
export default staffSlice.reducer;
