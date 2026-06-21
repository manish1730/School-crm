import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getStudents,
  deleteStudent,
  promoteStudents,
} from "../../../services/studentService";

export const fetchStudentsThunk = createAsyncThunk(
  "students/fetchStudents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getStudents(params);
      return response.data; // { success: true, data: [...] }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load students"
      );
    }
  }
);

export const deleteStudentThunk = createAsyncThunk(
  "students/deleteStudent",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteStudent(id);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete student"
      );
    }
  }
);

export const promoteStudentsThunk = createAsyncThunk(
  "students/promoteStudents",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await promoteStudents(payload);
      return response.data; // { success: true, message: "..." }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to promote students"
      );
    }
  }
);

const initialState = {
  list: [],
  selectedStudent: null,
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    clearStudentError: (state) => {
      state.error = null;
    },
    clearStudentSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch students
      .addCase(fetchStudentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data || [];
      })
      .addCase(fetchStudentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // delete student
      .addCase(deleteStudentThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteStudentThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list = state.list.filter(
          (student) => student._id !== action.payload.id
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteStudentThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // promote students
      .addCase(promoteStudentsThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(promoteStudentsThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage =
          action.payload.message || "Students promoted successfully";
      })
      .addCase(promoteStudentsThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedStudent,
  clearStudentError,
  clearStudentSuccess,
} = studentsSlice.actions;

export default studentsSlice.reducer;
