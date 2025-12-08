import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../utils/api";

// Fetch all tickets (for admins/engineers)
export const fetchAllTickets = createAsyncThunk(
    "tickets/fetchAllTickets",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/api/v1/tickets");
            return data?.tickets || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch tickets");
        }
    }
);

// Fetch tickets by reporter (current user's tickets)
export const fetchMyTickets = createAsyncThunk(
    "tickets/fetchMyTickets",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/api/v1/tickets/my-tickets");
            return data?.tickets || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch your tickets");
        }
    }
);

// Fetch tickets assigned to current user (for engineers)
export const fetchAssignedTickets = createAsyncThunk(
    "tickets/fetchAssignedTickets",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/api/v1/tickets/assigned");
            return data?.tickets || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch assigned tickets");
        }
    }
);

// Create a new ticket
export const createTicket = createAsyncThunk(
    "tickets/createTicket",
    async (ticketData, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/api/v1/tickets", ticketData);
            return data?.ticket;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to create ticket");
        }
    }
);

// Update ticket status
export const updateTicketStatus = createAsyncThunk(
    "tickets/updateTicketStatus",
    async ({ ticketId, status }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/api/v1/tickets/${ticketId}/status`, { status });
            return data?.ticket;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update ticket");
        }
    }
);

// Assign ticket to engineer
export const assignTicket = createAsyncThunk(
    "tickets/assignTicket",
    async ({ ticketId, assigneeId }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/api/v1/tickets/${ticketId}/assign`, { assigneeId });
            return data?.ticket;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to assign ticket");
        }
    }
);

// Delete ticket
export const deleteTicket = createAsyncThunk(
    "tickets/deleteTicket",
    async (ticketId, { rejectWithValue }) => {
        try {
            await api.delete(`/api/v1/tickets/${ticketId}`);
            return ticketId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete ticket");
        }
    }
);

const ticketSlice = createSlice({
    name: "tickets",
    initialState: {
        tickets: [],
        myTickets: [],
        assignedTickets: [],
        loading: false,
        error: null,
        createStatus: "idle",
        createError: null,
    },
    reducers: {
        clearTicketError: (state) => {
            state.error = null;
            state.createError = null;
        },
        resetCreateStatus: (state) => {
            state.createStatus = "idle";
            state.createError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all tickets
            .addCase(fetchAllTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload;
            })
            .addCase(fetchAllTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch my tickets
            .addCase(fetchMyTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.myTickets = action.payload;
            })
            .addCase(fetchMyTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch assigned tickets
            .addCase(fetchAssignedTickets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAssignedTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.assignedTickets = action.payload;
            })
            .addCase(fetchAssignedTickets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create ticket
            .addCase(createTicket.pending, (state) => {
                state.createStatus = "loading";
                state.createError = null;
            })
            .addCase(createTicket.fulfilled, (state, action) => {
                state.createStatus = "succeeded";
                if (action.payload) {
                    state.myTickets = [action.payload, ...state.myTickets];
                    state.tickets = [action.payload, ...state.tickets];
                }
            })
            .addCase(createTicket.rejected, (state, action) => {
                state.createStatus = "failed";
                state.createError = action.payload;
            })
            // Update ticket status
            .addCase(updateTicketStatus.fulfilled, (state, action) => {
                const updated = action.payload;
                if (updated) {
                    state.tickets = state.tickets.map((t) =>
                        t._id === updated._id ? updated : t
                    );
                    state.myTickets = state.myTickets.map((t) =>
                        t._id === updated._id ? updated : t
                    );
                    state.assignedTickets = state.assignedTickets.map((t) =>
                        t._id === updated._id ? updated : t
                    );
                }
            })
            // Assign ticket
            .addCase(assignTicket.fulfilled, (state, action) => {
                const updated = action.payload;
                if (updated) {
                    state.tickets = state.tickets.map((t) =>
                        t._id === updated._id ? updated : t
                    );
                }
            })
            // Delete ticket
            .addCase(deleteTicket.fulfilled, (state, action) => {
                const deletedId = action.payload;
                state.tickets = state.tickets.filter((t) => t._id !== deletedId);
                state.myTickets = state.myTickets.filter((t) => t._id !== deletedId);
                state.assignedTickets = state.assignedTickets.filter(
                    (t) => t._id !== deletedId
                );
            });
    },
});

export const { clearTicketError, resetCreateStatus } = ticketSlice.actions;
export default ticketSlice.reducer;

