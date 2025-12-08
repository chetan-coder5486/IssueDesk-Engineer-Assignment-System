import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

// Create a single socket instance
const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
});

export default socket;
