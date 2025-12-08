import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/user/login', { email, password });
            return data?.user || null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to login. Please try again.');
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async ({ name, email, password, confirmPassword, role, department }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/user/signup', { name, email, password, confirmPassword, role, department });
            return data?.user || null;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to signup. Please try again.');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.get('/api/v1/user/logout');
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to logout. Please try again.');
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async ({ email }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/api/v1/user/forgot-password', { email });
            return data?.message || 'If an account exists, a reset link has been sent.';
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send reset email.');
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, password, confirmPassword }, { rejectWithValue }) => {
        try {
            const url = `/api/v1/user/reset-password/${token}`;
            const { data } = await api.post(url, { password, confirmPassword });
            return data?.message || 'Password reset successful.';
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reset password.');
        }
    }
);

const initialState = {
    user: null,
    loginStatus: 'idle',
    signupStatus: 'idle',
    logoutStatus: 'idle',
    forgotStatus: 'idle',
    resetStatus: 'idle',
    loginError: null,
    signupError: null,
    logoutError: null,
    forgotError: null,
    resetError: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearLoginError(state) {
            state.loginError = null;
        },
        clearSignupError(state) {
            state.signupError = null;
        },
        resetSignupStatus(state) {
            state.signupStatus = 'idle';
            state.signupError = null;
        },
        resetLogoutStatus(state) {
            state.logoutStatus = 'idle';
            state.logoutError = null;
        },
        resetLoginStatus(state) {
            state.loginStatus = 'idle';
            state.loginError = null;
        },
        setSignupError(state, action) {
            state.signupError = action.payload;
        },
        // Force logout when session expires (refresh token fails)
        forceLogout(state) {
            state.user = null;
            state.loginStatus = 'idle';
            state.loginError = 'Session expired. Please log in again.';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loginStatus = 'loading';
                state.loginError = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loginStatus = 'succeeded';
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loginStatus = 'failed';
                state.loginError = action.payload || 'Failed to login.';
            })
            .addCase(signupUser.pending, (state) => {
                state.signupStatus = 'loading';
                state.signupError = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                state.signupStatus = 'succeeded';
                state.user = action.payload;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.signupStatus = 'failed';
                state.signupError = action.payload || 'Failed to signup.';
            })
            .addCase(logoutUser.pending, (state) => {
                state.logoutStatus = 'loading';
                state.logoutError = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.logoutStatus = 'succeeded';
                state.user = null;
                state.loginStatus = 'idle';
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.logoutStatus = 'failed';
                state.logoutError = action.payload || 'Failed to logout.';
            });

            builder
                .addCase(forgotPassword.pending, (state) => {
                    state.forgotStatus = 'loading';
                    state.forgotError = null;
                })
                .addCase(forgotPassword.fulfilled, (state, action) => {
                    state.forgotStatus = 'succeeded';
                })
                .addCase(forgotPassword.rejected, (state, action) => {
                    state.forgotStatus = 'failed';
                    state.forgotError = action.payload || 'Failed to send reset email.';
                })
                .addCase(resetPassword.pending, (state) => {
                    state.resetStatus = 'loading';
                    state.resetError = null;
                })
                .addCase(resetPassword.fulfilled, (state, action) => {
                    state.resetStatus = 'succeeded';
                })
                .addCase(resetPassword.rejected, (state, action) => {
                    state.resetStatus = 'failed';
                    state.resetError = action.payload || 'Failed to reset password.';
                });
    },
});

export const {
    clearLoginError,
    clearSignupError,
    resetSignupStatus,
    resetLogoutStatus,
    resetLoginStatus,
    setSignupError,
    forceLogout,
} = authSlice.actions;

export default authSlice.reducer;
