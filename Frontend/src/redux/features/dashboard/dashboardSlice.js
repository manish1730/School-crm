import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCardsAnalytics,
  getAttendanceTrend,
  getEnquiryFunnel,
  getCollectionTrend,
  getRecentActivities,
  getTodayBirthdays,
} from "../../../services/dashboardService";

export const fetchDashboardDataThunk = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const [
        cardsRes,
        attendanceRes,
        enquiryRes,
        collectionRes,
        activitiesRes,
        birthdaysRes,
      ] = await Promise.all([
        getCardsAnalytics(),
        getAttendanceTrend(),
        getEnquiryFunnel(),
        getCollectionTrend(),
        getRecentActivities(),
        getTodayBirthdays(),
      ]);

      return {
        cards: cardsRes.data.data,
        attendanceData: attendanceRes.data.data,
        enquiryData: enquiryRes.data.data,
        collectionData: collectionRes.data.data,
        activities: activitiesRes.data.data,
        birthdays: birthdaysRes.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load dashboard data"
      );
    }
  }
);

const initialState = {
  cards: {
    totalStudents: 0,
    totalStaff: 0,
    todayAttendance: 0,
    feeToday: 0,
    feeMonth: 0,
    pendingDues: 0,
    upcomingEvents: 0,
  },
  attendanceData: [],
  enquiryData: [],
  collectionData: [],
  activities: [],
  birthdays: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload.cards || state.cards;
        state.attendanceData = action.payload.attendanceData || [];
        state.enquiryData = action.payload.enquiryData || [];
        state.collectionData = action.payload.collectionData || [];
        state.activities = action.payload.activities || [];
        state.birthdays = action.payload.birthdays || [];
      })
      .addCase(fetchDashboardDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
