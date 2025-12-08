import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './utils/db.js';
import userRoute from './routes/user.route.js';
import ticketRoute from './routes/ticket.route.js';
import commentRoute from './routes/comment.route.js';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Connect to the database
connectDB();
const PORT = process.env.PORT || 8000;
// --- Middleware Setup ---
// To parse incoming JSON payloads
app.use(express.json());

// To parse incoming URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// To parse cookies from headers
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true, // Allows cookies to be sent from the frontend
};

app.use(cors(corsOptions));

//apis
app.use('/api/v1/user', userRoute);
app.use('/api/v1/tickets', ticketRoute);
app.use('/api/v1', commentRoute);

const server = http.createServer(app);
// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    },
});

// Export io for use in controllers
export { io };

// Socket logic for real-time comments
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a ticket room to receive real-time comment updates
    socket.on("join_ticket", (ticketId) => {
        socket.join(`ticket_${ticketId}`);
        console.log(`User ${socket.id} joined ticket room: ticket_${ticketId}`);
    });

    // Leave a ticket room
    socket.on("leave_ticket", (ticketId) => {
        socket.leave(`ticket_${ticketId}`);
        console.log(`User ${socket.id} left ticket room: ticket_${ticketId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
