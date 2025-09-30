# ChatApp-React

This is a React chat application that works in conjunction with an Express.js backend.

## Features

- **User Authentication**: The application handles user authentication by sending user credentials to an API endpoint (`/api/v1/users/login`) to receive a JWT token, which is stored in a cookie. A protected route ensures that only authenticated users can access the home page. The `jwt-decode` and `js-cookie` libraries are used to handle the token and cookies.
- **Real-time Messaging**: The application uses `socket.io-client` for real-time communication with the server.
- **Message Display**: Messages are displayed within a `ChatBox` component, and the `HomePage` is responsible for fetching messages upon loading.

## Installation

To run this project locally, follow these steps:

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Start the application: `npm start`.

The application will run on `http://localhost:3000`. It is configured to connect to a backend server running on `http://localhost:8000`.
