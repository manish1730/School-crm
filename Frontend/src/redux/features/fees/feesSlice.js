import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getFeeCollections,
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getStudentFeeSummary,
  recordFeePayment,
} from "../../../services/feeService";
import { getAcademicYears } from "../../../services/academicYearServices";
import { getStudents } from "../../../services/studentService";

export const fetchFeeCollectionsThunk = createAsyncThunk(
  "fees/fetchCollections",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getFeeCollections(params);
      return response.data; // { success: true, data: { collections: [], stats: {}, total: 0 } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load fee collections"
      );
    }
  }
);

export const fetchFeeStructuresThunk = createAsyncThunk(
  "fees/fetchStructures",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getFeeStructures(params);
      return response.data; // { success: true, data: [...] }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load fee structures"
      );
    }
  }
);

export const createFeeStructureThunk = createAsyncThunk(
  "fees/createStructure",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createFeeStructure(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create fee structure"
      );
    }
  }
);

export const updateFeeStructureThunk = createAsyncThunk(
  "fees/updateStructure",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateFeeStructure(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update fee structure"
      );
    }
  }
);

export const deleteFeeStructureThunk = createAsyncThunk(
  "fees/deleteStructure",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteFeeStructure(id);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete fee structure"
      );
    }
  }
);

export const fetchStudentFeeSummaryThunk = createAsyncThunk(
  "fees/fetchStudentSummary",
  async ({ studentId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await getStudentFeeSummary(studentId, params);
      return response.data; // { success: true, data: { summary: ..., transactions: ... } }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load student fee summary"
      );
    }
  }
);

export const recordFeePaymentThunk = createAsyncThunk(
  "fees/recordPayment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await recordFeePayment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to record payment"
      );
    }
  }
);

export const fetchFeeStudentsThunk = createAsyncThunk(
  "fees/fetchStudents",
  async (_, { rejectWithValue }) => {
    try {
      const studentsRes = await getStudents();
      return {
        students: studentsRes.data.data || [],
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load students data"
      );
    }
  }
);

const initialState = {
  students: [],
  mastersLoaded: false,
  // collections
  collections: [],
  collectionTotal: 0,
  collectionStats: {
    totalStudents: 0,
    totalCollected: 0,
    pendingAmount: 0,
    overduePayments: 0,
  },
  // structures
  structures: [],
  structureTotal: 0,
  // payment
  studentFeeSummary: null,
  // async state
  loading: false,
  mastersLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    clearFeesError: (state) => {
      state.error = null;
    },
    clearFeesSuccess: (state) => {
      state.successMessage = null;
    },
    clearStudentFeeSummary: (state) => {
      state.studentFeeSummary = null;
    },
    setStudentSummaryFromRow: (state, action) => {
      // Pre-populate fee summary from a collection list row (no extra API call)
      state.studentFeeSummary = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Students
      .addCase(fetchFeeStudentsThunk.pending, (state) => {
        state.mastersLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeStudentsThunk.fulfilled, (state, action) => {
        state.mastersLoading = false;
        state.students = action.payload.students;
      })
      .addCase(fetchFeeStudentsThunk.rejected, (state, action) => {
        state.mastersLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      })
      // collections
      .addCase(fetchFeeCollectionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeCollectionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.data?.collections || [];
        state.collectionStats = action.payload.data?.stats || state.collectionStats;
        state.collectionTotal = action.payload.data?.total || 0;
      })
      .addCase(fetchFeeCollectionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      })
      // structures
      .addCase(fetchFeeStructuresThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeeStructuresThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.structures = action.payload.data || [];
        state.structureTotal = action.payload.total || 0;
      })
      .addCase(fetchFeeStructuresThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      })
      // save structure (create/update)
      .addCase(createFeeStructureThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createFeeStructureThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createFeeStructureThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      })
      .addCase(updateFeeStructureThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateFeeStructureThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(updateFeeStructureThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      })
      // delete structure
      .addCase(deleteFeeStructureThunk.fulfilled, (state, action) => {
        state.structures = state.structures.filter(
          (item) => item._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteFeeStructureThunk.rejected, (state, action) => {
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      })
      // student summary
      .addCase(fetchStudentFeeSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentFeeSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.studentFeeSummary = action.payload.data;
      })
      .addCase(fetchStudentFeeSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      })
      // pay fee
      .addCase(recordFeePaymentThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(recordFeePaymentThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(recordFeePaymentThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : action.payload?.message || action.error?.message || "Something went wrong";
      });
  },
});

export const {
  clearFeesError,
  clearFeesSuccess,
  clearStudentFeeSummary,
  setStudentSummaryFromRow,
} = feesSlice.actions;

// Selectors
export const selectFeeCollections = (state) => state.fees.collections;
export const selectFeeCollectionStats = (state) => state.fees.collectionStats;
export const selectFeeCollectionTotal = (state) => state.fees.collectionTotal;
export const selectFeeStructures = (state) => state.fees.structures;
export const selectFeeStructureTotal = (state) => state.fees.structureTotal;
export const selectStudentFeeSummary = (state) => state.fees.studentFeeSummary;
export const selectFeesLoading = (state) => state.fees.loading;
export const selectFeesActionLoading = (state) => state.fees.actionLoading;
export const selectFeeMastersLoading = (state) => state.fees.mastersLoading;
export const selectFeeStudents = (state) => state.fees.students;

export default feesSlice.reducer;
