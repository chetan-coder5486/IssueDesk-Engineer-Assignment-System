import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { connectDB } from './utils/db.js';
import userRoute from './routes/user.route.js';

const app = express();

// Connect to the database
connectDB();
const PORT = process.env.PORT || 3000;
// --- Middleware Setup ---
// To parse incoming JSON payloads
app.use(express.json());

// To parse incoming URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// To parse cookies from headers
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
    // <-- FIX #2: Added the missing colon in the URL
    origin: "http://localhost:5173",
    credentials: true, // Allows cookies to be sent from the frontend
};

app.use(cors(corsOptions));

//apis
app.use('/api/v1/user', userRoute);

const server = http.createServer(app);
// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Socket logic
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User joined room ${roomId}`);
    });

    socket.on("send_message", (data) => {
        io.to(data.roomId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
