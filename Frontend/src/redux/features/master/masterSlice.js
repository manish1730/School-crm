import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { fetchAllMasterData } from "../../../services/masterService";

export const fetchMasterDataThunk = createAsyncThunk(
  "master/fetchMasterData",
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllMasterData();
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load master data"
      );
    }
  }
);

const initialState = {
  academicYears: [],
  classSections: [],
  classes: [],
  sections: [],
  subjects: [],
  departments: [],
  designations: [],
  categories: [],
  examTypes: [],
  feeTypes: [],
  loading: false,
  error: null,
  isLoaded: false,
};

const masterSlice = createSlice({
  name: "master",
  initialState,
  reducers: {
    clearMasterError: (state) => {
      state.error = null;
    },
    // Optional: Add reducers for optimistic UI updates if required later
    // e.g., addClass: (state, action) => { state.classes.push(action.payload); }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoaded = true;
        state.academicYears = action.payload.academicYears || [];
        state.classSections = action.payload.classSections || [];
        state.classes = action.payload.classes || [];
        state.sections = action.payload.sections || [];
        state.subjects = action.payload.subjects || [];
        state.departments = action.payload.departments || [];
        state.designations = action.payload.designations || [];
        state.categories = action.payload.categories || [];
        state.examTypes = action.payload.examTypes || [];
        state.feeTypes = action.payload.feeTypes || [];
      })
      .addCase(fetchMasterDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMasterError } = masterSlice.actions;

// Memoized Selectors for optimal performance
const selectMasterState = (state) => state.master;

export const selectAllClasses = createSelector(
  [selectMasterState],
  (master) => master.classes
);

export const selectAllSections = createSelector(
  [selectMasterState],
  (master) => master.sections
);

export const selectAllSubjects = createSelector(
  [selectMasterState],
  (master) => master.subjects
);

export const selectClassSections = createSelector(
  [selectMasterState],
  (master) => master.classSections
);

export const selectCategories = createSelector(
  [selectMasterState],
  (master) => master.categories
);

export const selectAllAcademicYears = createSelector(
  [selectMasterState],
  (master) => master.academicYears
);

export const selectActiveAcademicYear = createSelector(
  [selectAllAcademicYears],
  (academicYears) => academicYears.find(year => year.isCurrentYear) || academicYears[0]
);

export const selectDepartments = createSelector(
  [selectMasterState],
  (master) => master.departments
);

export const selectDesignations = createSelector(
  [selectMasterState],
  (master) => master.designations
);

export const selectExamTypes = createSelector(
  [selectMasterState],
  (master) => master.examTypes
);

export const selectFeeTypes = createSelector(
  [selectMasterState],
  (master) => master.feeTypes
);

export default masterSlice.reducer;
