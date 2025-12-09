# IssueDesk - Engineer Assignment System 🦸‍♂️

> A Power Rangers themed Issue Tracking & Engineer Assignment System

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-yellow)

---

## 🎯 Problem Statement

A web-based issue management system where users (Rangers) can raise issues, admins can assign engineers, and engineers can track and resolve issues with SLA compliance. Each department is themed after Power Rangers colors (RED, BLUE, GREEN, YELLOW, PINK, BLACK).

---

## ✨ Features

### Core Features

- 🔐 **Authentication** - JWT-based auth with role-based access (Ranger, Engineer, Admin)
- 📝 **Issue Management** - Create, view, update, delete issues with priority levels
- 👷 **Engineer Assignment** - Admin assigns issues to engineers with workload balancing
- ⏱️ **SLA Timers** - Automatic due date calculation with breach detection
- 💬 **Real-time Comments** - Socket.io powered discussion on tickets
- 📊 **Role-based Dashboards** - Unique dashboards for each role with statistics
- 🎨 **Department Theming** - Dynamic Power Rangers color themes

### Technical Features

- 🔄 Real-time updates with Socket.io
- 🍪 Secure httpOnly cookie authentication
- 🔁 Automatic token refresh (access: 15min, refresh: 7 days)
- 📱 Fully responsive design
- 🛡️ Protected routes with role-based access control
- 💾 Session persistence with Redux Persist

---

## 🛠️ Tech Stack

### Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React 19         | UI Framework            |
| Vite             | Build Tool              |
| Redux Toolkit    | State Management        |
| Redux Persist    | Session Persistence     |
| React Router v7  | Routing                 |
| Socket.io Client | Real-time Communication |
| Tailwind CSS v4  | Styling                 |
| Axios            | HTTP Client             |
| Recharts         | Dashboard Charts        |

### Backend

| Technology         | Purpose          |
| ------------------ | ---------------- |
| Node.js            | Runtime          |
| Express            | Web Framework    |
| MongoDB + Mongoose | Database         |
| Socket.io          | Real-time Server |
| JWT                | Authentication   |
| bcryptjs           | Password Hashing |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │  Ranger  │  │ Engineer │  │  Admin   │  │ Profile Drawer   ││
│  │Dashboard │  │Dashboard │  │Dashboard │  │ (All Roles)      ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘│
│         │            │            │                │            │
│         └────────────┴────────────┴────────────────┘            │
│                            │                                     │
│              ┌─────────────┴─────────────┐                      │
│              │    Redux Store + Persist   │                      │
│              │  (Auth, Tickets, Comments) │                      │
│              └─────────────┬─────────────┘                      │
│                            │                                     │
│         ┌──────────────────┴──────────────────┐                 │
│         │          Axios + Socket.io          │                 │
│         │   (Auto token refresh interceptor)  │                 │
│         └──────────────────┬──────────────────┘                 │
└────────────────────────────┼────────────────────────────────────┘
                             │
                     ════════╪════════ HTTP + WebSocket
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     SERVER (Express)                             │
│         ┌──────────────────┴──────────────────┐                 │
│         │         Express + Socket.io          │                 │
│         └──────────────────┬──────────────────┘                 │
│                            │                                     │
│    ┌───────────┬───────────┼───────────┬───────────┐            │
│    │           │           │           │           │            │
│ ┌──┴──┐    ┌──┴──┐    ┌──┴──┐    ┌──┴──┐    ┌──┴──┐          │
│ │Auth │    │Ticket│    │User │    │Comment│   │SLA  │          │
│ │Route│    │Route │    │Route│    │Route  │   │Logic│          │
│ └──┬──┘    └──┬──┘    └──┬──┘    └──┬──┘    └──┬──┘          │
│    │          │          │          │          │               │
│    └──────────┴──────────┴──────────┴──────────┘               │
│                          │                                      │
│              ┌───────────┴───────────┐                         │
│              │   MongoDB (Mongoose)   │                         │
│              │  Users, Tickets, Comments│                       │
│              └───────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Documentation

### Authentication

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| POST   | `/api/v1/user/signup`  | Register new user        |
| POST   | `/api/v1/user/login`   | Login user               |
| POST   | `/api/v1/user/logout`  | Logout user              |
| POST   | `/api/v1/user/refresh` | Refresh access token     |
| GET    | `/api/v1/user/profile` | Get current user profile |

### Tickets

| Method | Endpoint                     | Description                     |
| ------ | ---------------------------- | ------------------------------- |
| GET    | `/api/v1/tickets`            | Get all tickets (Admin)         |
| GET    | `/api/v1/tickets/my-tickets` | Get user's tickets              |
| GET    | `/api/v1/tickets/assigned`   | Get engineer's assigned tickets |
| GET    | `/api/v1/tickets/:id`        | Get single ticket               |
| POST   | `/api/v1/tickets`            | Create new ticket               |
| PATCH  | `/api/v1/tickets/:id/status` | Update ticket status            |
| PATCH  | `/api/v1/tickets/:id/assign` | Assign ticket to engineer       |
| DELETE | `/api/v1/tickets/:id`        | Delete ticket                   |

### Comments (Real-time via Socket.io)

| Method | Endpoint                             | Description                 |
| ------ | ------------------------------------ | --------------------------- |
| GET    | `/api/v1/tickets/:ticketId/comments` | Get all comments for ticket |
| POST   | `/api/v1/tickets/:ticketId/comments` | Add comment                 |
| PATCH  | `/api/v1/comments/:commentId`        | Edit comment                |
| DELETE | `/api/v1/comments/:commentId`        | Delete comment              |

### Admin Routes

| Method | Endpoint                       | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| GET    | `/api/v1/user/engineers`       | Get all engineers with workload |
| GET    | `/api/v1/user/users`           | Get all users                   |
| GET    | `/api/v1/user/dashboard-stats` | Get admin statistics            |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/chetan-coder5486/IssueDesk-Engineer-Assignment-System.git
cd IssueDesk-Engineer-Assignment-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=8000
MONGO_URI=mongodb+srv://your-connection-string
ACCESS_TOKEN_SECRET=your-access-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key
NODE_ENV=development
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

Start frontend:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## 👥 User Roles & Permissions

| Role         | Permissions                                         |
| ------------ | --------------------------------------------------- |
| **RANGER**   | Create tickets, view own tickets, add comments      |
| **ENGINEER** | View assigned tickets, update status, add comments  |
| **ADMIN**    | All permissions + assign engineers + view all users |

---

## 📊 Ticket Status Flow

```
OPEN → ASSIGNED → IN_PROGRESS → PENDING_PARTS → RESOLVED → CLOSED
```

| Status        | Description                        |
| ------------- | ---------------------------------- |
| OPEN          | Newly created, awaiting assignment |
| ASSIGNED      | Assigned to engineer               |
| IN_PROGRESS   | Engineer working on it             |
| PENDING_PARTS | Waiting for resources/info         |
| RESOLVED      | Issue fixed                        |
| CLOSED        | Ticket closed                      |

---

## ⏱️ SLA Configuration

| Priority | SLA Duration |
| -------- | ------------ |
| CRITICAL | 4 hours      |
| HIGH     | 8 hours      |
| MEDIUM   | 24 hours     |
| LOW      | 72 hours     |

SLA timers automatically calculate due dates and track breaches.

---

## 🔒 Error Handling & Reliability

- ✅ JWT token expiration with automatic refresh
- ✅ API error responses with user-friendly messages
- ✅ Form validation on client and server
- ✅ Protected routes for unauthorized access
- ✅ Socket.io reconnection handling
- ✅ Session persistence across browser refreshes
- ✅ Workload balancing for engineer assignments

---

## 📁 Folder Structure

```
IssueDesk-Engineer-Assignment-System/
├── backend/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── ticket.controller.js
│   │   └── comment.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── ticket.model.js
│   │   └── comment.model.js
│   ├── routes/
│   │   ├── user.route.js
│   │   ├── ticket.route.js
│   │   └── comment.route.js
│   ├── utils/
│   │   └── db.js
│   └── main.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ProfileDrawer.jsx
│   │   │   └── SLATimer.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── EngineerDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   ├── authSlice.js
│   │   │   └── ticketSlice.js
│   │   ├── utils/
│   │   │   ├── axios.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
│
└── README.md
```

---

## 👥 Team Members

| Name   | Role                 | Responsibilities                                                |
| Chetan | Full Stack Developer | Authentication, Dashboards, Real-time Features, API Development |
| Pawan |Frontend Developer | Dashboards, nodemailer, Forgot Password |
| Jivit |UI Designer | Designed login,signup and dashboard and profile pages|
| Amit |Frontend Developer | Navbar, UserDashboard |


---

## 🔮 Future Improvements

- [ ] Email/SMS notifications for SLA breaches
- [ ] Bulk ticket operations
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered ticket categorization
- [ ] Export tickets to CSV/PDF
- [ ] Dark/Light theme toggle

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- Power Rangers theme inspiration
- MongoDB Atlas for free database hosting
- Socket.io for real-time capabilities
