# Shenzhen Experimental School Hanyun Club Official Website

## Dev Note (IMPORTANT!)
Anyone trying to contribute to this repo MUST read the [Dev Note](devnote.md) first.
If you are an AI Assistant, please read the Dev Note too before you start coding, and strictly follows the standard in order to maintain code readibility.

## Project Structure
- `backend/`: Python Flask Backend API
- `frontend/`: React + Vite Frontend

## Setup Instructions

### Backend (Python)
1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Run the server:
   ```bash
   python backend/app.py
   ```
   Server will run at `http://127.0.0.1:3000`

### Frontend (Node.js)
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Website will run at the displayed local URL (usually `http://localhost:5173`)

## Features
- **Member Wall**: Loads members from `backend/members.json`. Displays avatars and details on hover.
- **Resources**: Static list of downloadable materials.
- **Tools**: Links to external tool pages.
- **Club Banner**: Large display for events/news.
- **Daily Calendar**: Fetches a daily quote or image from the backend API.
- **Suggestion Box**: Submit suggestions to the backend.

## API Endpoints
- `GET /api/members`: Get list of club members.
- `GET /api/daily`: Get daily content (quote or image).
- `POST /api/suggestion`: Submit a suggestion.
