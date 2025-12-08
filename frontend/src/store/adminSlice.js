import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../utils/api";

// Fetch all engineers
export const fetchEngineers = createAsyncThunk(
    "admin/fetchEngineers",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/api/v1/user/engineers");
            return data?.engineers || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch engineers");
        }
    }
);

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
    "admin/fetchAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/api/v1/user/users");
            return data?.users || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
        }
    }
);

// Fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
    "admin/fetchDashboardStats",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/api/v1/user/dashboard-stats");
            return data?.stats || {};
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
        }
    }
);

// Update engineer status
export const updateEngineer = createAsyncThunk(
    "admin/updateEngineer",
    async ({ userId, workloadScore, isOnline }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/api/v1/user/engineers/${userId}`, { workloadScore, isOnline });
            return data?.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update engineer");
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        engineers: [],
        users: [],
        stats: {
            totalUsers: 0,
            totalEngineers: 0,
            onlineEngineers: 0,
            totalTickets: 0,
            openTickets: 0,
            assignedTickets: 0,
            inProgressTickets: 0,
            resolvedTickets: 0,
            criticalTickets: 0,
            breachedTickets: 0,
            ticketsByPriority: [],
            ticketsByDepartment: []
        },
        loading: false,
        error: null,
    },
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch engineers
            .addCase(fetchEngineers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEngineers.fulfilled, (state, action) => {
                state.loading = false;
                state.engineers = action.payload;
            })
            .addCase(fetchEngineers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch all users
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch dashboard stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update engineer
            .addCase(updateEngineer.fulfilled, (state, action) => {
                const updated = action.payload;
                if (updated) {
                    state.engineers = state.engineers.map((e) =>
                        e._id === updated._id ? updated : e
                    );
                }
            });
    },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
