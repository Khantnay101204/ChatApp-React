# ChatApp-React

Frontend single-page application for a real-time, end-to-end encrypted 1-on-1 and group messaging platform built with React and Socket.IO. Styled with a minimalist hand-drawn pencil sketch aesthetic featuring white containers, rounded corners, graphite borders, and handwritten typography.

## Features

- **Hand-Drawn Pencil Sketch UI**: Custom monochrome design (`ChatUI.css`) using white backgrounds, organic rounded corners, SVG `<feTurbulence>` / `<feDisplacementMap>` pencil-stroke borders, soft graphite (`#1f1f1f`) ink, and `Patrick Hand` typography.
- **Real-Time Messaging & Sync**: Powered by `socket.io-client` (`SocketConfig.jsx`) for instant message delivery, live inline message edits, automatic sidebar inbox reordering, and real-time group updates without refreshing.
- **1-on-1 Direct Messages**: Live debounced user search by name or email with lazy chat creation—direct message rooms are created automatically upon sending the first message.
- **Group Chat Management**: Create group chats via `GroupModal`, view group members, and manage group settings (admin-only group renaming, adding/removing members, and voluntary group exit).
- **In-Chat System Announcements**: Displays centered announcement pills directly in the message feed whenever members are added, removed, or leave a group.
- **Protected Routing & JWT Auth**: Supports JWT authentication via browser cookies (`jwt`) with `localStorage` fallback, guarded by `ProtectedRoute` and `isTokenValid`.

## Tech Stack

- **Framework**: React (Create React App)
- **Routing**: React Router DOM
- **Real-Time Client**: Socket.IO Client
- **Styling**: Custom CSS with inline SVG displacement filters & Google Fonts (`Patrick Hand`)

## Project Structure

```text
ChatApp-React/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── Home/
│   │   ├── HomePage.jsx        # Main layout, sidebar inbox, user search & global socket listeners
│   │   ├── ChatBox.jsx         # Active conversation view, message composer & group admin drawer
│   │   ├── MsgBubble.jsx       # Message bubble component with inline editing & timestamps
│   │   ├── GroupModal.jsx      # Modal for creating new group chats
│   │   ├── chatApi.jsx         # Centralized API client with JWT cookie/header auth
│   │   ├── ChatUI.css          # Hand-drawn pencil sketch stylesheet
│   │   ├── fetchMsg.jsx        # Message fetch helper
│   │   └── fetchUsername.jsx   # User lookup helper
│   ├── Login/
│   │   └── LoginPage.jsx       # User login & authentication handler
│   ├── util/
│   │   ├── ProtectedRoute.jsx  # Route guard for authenticated views
│   │   └── isTokenValid.jsx    # Client-side JWT validation utility
│   ├── App.jsx                 # Application routes
│   ├── App.css
│   ├── index.js                # React DOM entry point
│   ├── index.css
│   └── SocketConfig.jsx        # Shared Socket.IO client instance
├── .env                        # Environment variables
└── package.json
```

## Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or update the `.env` file in the project root so the frontend points to your running `ChatApp-Express` server port:

```env
PORT=8080
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_SOCKET_URL=http://localhost:8000
```

_(Ensure the port in `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` matches the `PORT` configured in your backend's `config.env`, and that your backend CORS origin allows `http://localhost:8080`.)_

### 3. Run the Application

```bash
# Start the React development server
npm start

# Build for production
npm run build
```

## Backend Integration Overview

### REST API Endpoints (`src/Home/chatApi.jsx`)

- **Users**: `GET /users?search=<query>` for finding recipients and group members.
- **Chats & Groups**: `GET /chats`, `POST /chats/group`, `PUT /chats/rename`, `PUT /chats/groupadd`, `PUT /chats/groupremove`.
- **Messages**: `GET /messages/:chatId`, `POST /messages`, `PATCH /messages/single/:id`.

### Socket.IO Events (`HomePage.jsx` & `ChatBox.jsx`)

- **Emitted by Client**: `setup`, `join chat`, `new message`, `edit message`, `group renamed`.
- **Listened by Client**: `connected`, `message received`, `inbox updated`, `message edited`, `group updated`, `added to group`, `removed from group`.
