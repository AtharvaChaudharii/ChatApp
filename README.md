# PolyChat 🌐💬  
**Real-time multilingual chat application with AI-powered translation**

[![GitHub license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)

## Features ✨
- **Real-time multilingual messaging** with <1s translation-reception latency
- **Gemini 2.0 Flash integration** for accurate message translation
- Supports **10+ languages** with 96%+ translation accuracy
- **Socket.io** for instant message delivery
- **MongoDB** for persistent chat history
- Responsive **React** frontend with modern UI

## Tech Stack 🛠️
| Category       | Technologies |
|----------------|-------------|
| **Frontend**   | React, Socket.io-client |
| **Backend**    | Node.js, Express, Socket.io |
| **AI**         | Gemini Pro API |
| **Database**   | MongoDB |
| **DevOps**     | Git, GitHub |

## Installation ⚙️
```bash
# Clone repository
git clone https://github.com/yourusername/polychat.git

# Install dependencies
cd polychat
npm install

# Set up environment variables
cd client
touch .env
add below inside the .env
VITE_SERVER_URL="http://localhost:8747"

cd server
touch .env
add below inside .env
PORT=8747
JWT_KEY=""
ORIGIN="http://localhost:5173"
DATABASE_URL=""
GEMINI_API_KEY=""


# Run development server
npm run dev


