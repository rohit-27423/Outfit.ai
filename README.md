<div align="center">
  <h1>✨ Outfit.ai</h1>
  <p><strong>Your Personal AI Stylist & Digital Wardrobe</strong></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-2ea44f?style=for-the-badge)](https://outfit-ai-eta.vercel.app)
</div>

<br />

Outfit.ai is a full-stack, AI-powered wardrobe management and styling application. It allows users to digitize their closet, receive intelligent outfit recommendations based on their clothes, and save their favorite styles—all within a beautifully designed, modern interface.

## 🌟 Features

- **Digital Wardrobe Management:** Upload and categorize your clothing items (tops, bottoms, shoes, accessories).
- **AI Outfit Recommendations:** Get intelligent style suggestions based on your existing wardrobe.
- **Guest Mode:** Try out the application instantly without needing to register.
- **Secure Authentication:** Full JWT-based user authentication (Signup, Login).
- **Responsive Modern UI:** A beautiful, responsive interface designed with a dark-mode-first approach.

## 💻 Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Custom Vanilla CSS with a focus on modern aesthetics, gradients, and micro-animations.
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Hosting:** [Vercel](https://vercel.com/)

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** PostgreSQL hosted on [Neon](https://neon.tech/)
- **ORM:** SQLAlchemy (with `asyncpg` for asynchronous database operations)
- **Authentication:** OAuth2 with JWT (JSON Web Tokens)
- **Migrations:** Alembic
- **Hosting:** [Render](https://render.com/)

---

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.9+
- Node.js 18+
- A PostgreSQL Database (Local or Cloud like Neon)

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory (you can copy `.env.example`) and add your database URL:
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/outfit_ai
JWT_SECRET_KEY=your_super_secret_key
```

Run database migrations:
```bash
alembic upgrade head
```

Start the backend server:
```bash
uvicorn app.main:app --reload
```
*The backend will be running at `http://127.0.0.1:8000`*

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
*The frontend will be running at `http://localhost:3000`*

---

## 🌍 Environment Variables

For production deployment, ensure the following environment variables are set:

**Vercel (Frontend):**
- `NEXT_PUBLIC_API_URL`: URL of your backend API (e.g., `https://your-backend.onrender.com/api/v1`)

**Render (Backend):**
- `DATABASE_URL`: Connection string to your Postgres database (must use `postgresql+asyncpg://`)
- `JWT_SECRET_KEY`: Secure random string for token encryption
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs (e.g., `https://outfit-ai-eta.vercel.app`)

---

## 📝 License

This project is licensed under the MIT License.
