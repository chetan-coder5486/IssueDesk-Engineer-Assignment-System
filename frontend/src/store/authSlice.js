import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.USER_API_ENDPOINT || 'http://localhost:8000';

const parseResponse = async (response) => {
    try {
        return await response.json();
    } catch (error) {
        return {};
    }
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await parseResponse(response);
            if (!response.ok) {
                const message = data?.message || 'Failed to login. Please try again.';
                return rejectWithValue(message);
            }

            return data?.user || null;
        } catch (error) {
            return rejectWithValue(error?.message || 'Unable to connect to the server.');
        }
    }
);

export const signupUser = createAsyncThunk(
    'auth/signupUser',
    async ({ name, email, password, confirmPassword, role, department }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name, email, password, confirmPassword, role, department }),
            });

            const data = await parseResponse(response);
            if (!response.ok) {
                const message = data?.message || 'Failed to signup. Please try again.';
                return rejectWithValue(message);
            }

            return data?.user || null;
        } catch (error) {
            return rejectWithValue(error?.message || 'Unable to connect to the server.');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/logout`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok && response.status !== 204) {
                const data = await parseResponse(response);
                const message = data?.message || 'Failed to logout. Please try again.';
                return rejectWithValue(message);
            }

            return true;
        } catch (error) {
            return rejectWithValue(error?.message || 'Unable to connect to the server.');
        }
    }
);

const initialState = {
    user: null,
    loginStatus: 'idle',
    signupStatus: 'idle',
    logoutStatus: 'idle',
    loginError: null,
    signupError: null,
    logoutError: null,
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
    },
});

export const {
    clearLoginError,
    clearSignupError,
    resetSignupStatus,
    resetLogoutStatus,
    resetLoginStatus,
    setSignupError,
} = authSlice.actions;

export default authSlice.reducer;
