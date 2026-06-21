import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import masterReducer from "./features/master/masterSlice";
import studentsReducer from "./features/students/studentsSlice";
import staffReducer from "./features/staff/staffSlice";
import attendanceReducer from "./features/attendance/attendanceSlice";
import feesReducer from "./features/fees/feesSlice";
import dashboardReducer from "./features/dashboard/dashboardSlice";
import settingsReducer from "./features/settings/settingsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    master: masterReducer,
    students: studentsReducer,
    staff: staffReducer,
    attendance: attendanceReducer,
    fees: feesReducer,
    dashboard: dashboardReducer,
    settings: settingsReducer,
  },
});

export default store;
