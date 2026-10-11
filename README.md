# Ticket Booking System — Frontend

A responsive web application built with React that allows users to explore events and book tickets through a Spring Boot REST API.

## Features

- **Event Listing:** Fetch and display events from the backend.
- **Ticket Booking:** Book tickets by entering name, email, mobile number, and ticket quantity.
- **Event Selection:** Select an event and submit a booking request.
- **Form Validation:** Validate booking details before submission.
- **Booking Feedback:** Display booking success or error messages.
- **Backend Integration:** Communicate with the Spring Boot backend using REST APIs.

## Tech Stack

- React
- JavaScript
- Vite
- HTML5
- CSS3
- Fetch API
- Git and GitHub

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- Git

The Spring Boot backend should be running locally for event loading and booking operations.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/akkisuryan123/ticket-booking-system-frontend.git
cd ticket-booking-system-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open the URL shown in your terminal. By default, Vite uses:

http://localhost:5173

## Backend Configuration

The frontend communicates with the Spring Boot backend running on:

http://localhost:9090

The Vite development server proxies API requests beginning with `/api` to the backend. Check `vite.config.js` for the proxy configuration.

Make sure the backend and MySQL database are configured and running before testing the booking flow.

## Project Structure

```text
ticket-booking-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Backend Repository

https://github.com/akkisuryan123/ticket-booking-system-backend

## Author

**Abhishek Suryan**

GitHub: https://github.com/akkisuryan123
