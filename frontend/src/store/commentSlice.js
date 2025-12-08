import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../utils/api";

// Fetch comments for a ticket
export const fetchComments = createAsyncThunk(
    "comments/fetchComments",
    async (ticketId, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/api/v1/tickets/${ticketId}/comments`);
            return { ticketId, comments: data?.comments || [] };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch comments");
        }
    }
);

// Add a comment to a ticket
export const addComment = createAsyncThunk(
    "comments/addComment",
    async ({ ticketId, content }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/api/v1/tickets/${ticketId}/comments`, { content });
            return { ticketId, comment: data?.comment };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to add comment");
        }
    }
);

// Edit a comment
export const editComment = createAsyncThunk(
    "comments/editComment",
    async ({ commentId, content, ticketId }, { rejectWithValue }) => {
        try {
            const { data } = await api.patch(`/api/v1/comments/${commentId}`, { content });
            return { ticketId, comment: data?.comment };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to edit comment");
        }
    }
);

// Delete a comment
export const deleteComment = createAsyncThunk(
    "comments/deleteComment",
    async ({ commentId, ticketId }, { rejectWithValue }) => {
        try {
            await api.delete(`/api/v1/comments/${commentId}`);
            return { ticketId, commentId };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete comment");
        }
    }
);

const initialState = {
    commentsByTicket: {}, // { ticketId: [comments] }
    loading: false,
    error: null,
};

const commentSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {
        clearComments: (state) => {
            state.commentsByTicket = {};
            state.error = null;
        },
        clearTicketComments: (state, action) => {
            delete state.commentsByTicket[action.payload];
        },
        // Socket.io real-time actions
        addCommentFromSocket: (state, action) => {
            const { ticketId, comment } = action.payload;
            if (!state.commentsByTicket[ticketId]) {
                state.commentsByTicket[ticketId] = [];
            }
            // Avoid duplicates
            const exists = state.commentsByTicket[ticketId].some(c => c._id === comment._id);
            if (!exists) {
                state.commentsByTicket[ticketId].push(comment);
            }
        },
        updateCommentFromSocket: (state, action) => {
            const { ticketId, comment } = action.payload;
            const ticketComments = state.commentsByTicket[ticketId];
            if (ticketComments) {
                const index = ticketComments.findIndex((c) => c._id === comment._id);
                if (index !== -1) {
                    ticketComments[index] = comment;
                }
            }
        },
        removeCommentFromSocket: (state, action) => {
            const { ticketId, commentId } = action.payload;
            const ticketComments = state.commentsByTicket[ticketId];
            if (ticketComments) {
                state.commentsByTicket[ticketId] = ticketComments.filter(
                    (c) => c._id !== commentId
                );
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch comments
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.loading = false;
                state.commentsByTicket[action.payload.ticketId] = action.payload.comments;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add comment
            .addCase(addComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.loading = false;
                const { ticketId, comment } = action.payload;
                if (!state.commentsByTicket[ticketId]) {
                    state.commentsByTicket[ticketId] = [];
                }
                state.commentsByTicket[ticketId].push(comment);
            })
            .addCase(addComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Edit comment
            .addCase(editComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editComment.fulfilled, (state, action) => {
                state.loading = false;
                const { ticketId, comment } = action.payload;
                const ticketComments = state.commentsByTicket[ticketId];
                if (ticketComments) {
                    const index = ticketComments.findIndex((c) => c._id === comment._id);
                    if (index !== -1) {
                        ticketComments[index] = comment;
                    }
                }
            })
            .addCase(editComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete comment
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                const { ticketId, commentId } = action.payload;
                const ticketComments = state.commentsByTicket[ticketId];
                if (ticketComments) {
                    state.commentsByTicket[ticketId] = ticketComments.filter(
                        (c) => c._id !== commentId
                    );
                }
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearComments, clearTicketComments, addCommentFromSocket, updateCommentFromSocket, removeCommentFromSocket } = commentSlice.actions;
export default commentSlice.reducer;
