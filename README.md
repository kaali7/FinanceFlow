# Financial Literacy & Budgeting Assistant

## 🧠 Project Overview
A full-stack application designed to educate users about budgeting and savings, strictly adhering to ethical AI principles. It helps users manage income and expenses without providing financial advice.

**Aligned with SDG 8: Decent Work and Economic Growth.**

## 🏗️ Tech Stack
- **Backend:** FastAPI, LangChain
- **Database:** Supabase (PostgreSQL)
- **AI Model:** Gemini (Free version)
- **Frontend:** React (Vite), Tailwind CSS

## 🚀 Setup Instructions

### 1. Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   - Rename `.env.example` to `.env`.
   - Add your `SUPABASE_URL`, `SUPABASE_KEY`, and `GOOGLE_API_KEY`.
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   Server will run at `http://localhost:8000`.

### 2. Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   App will run at `http://localhost:5173`.

## 🗄️ Database Setup
- Run the SQL scripts in `backend/database_schema.sql` in your Supabase SQL Editor to create the necessary tables.

## 🤖 AI Safety & Ethics
- The AI is instructed **NOT** to provide financial advice (investment, trading).
- It focuses solely on educational concepts and budgeting help.
- All calculations (budgeting, savings) are done deterministically by the backend, not the AI.

## 🌍 SDG Impact
This project supports **SDG 8** by promoting financial literacy, helping individuals manage their resources better, and fostering economic stability through responsible budgeting habits.
