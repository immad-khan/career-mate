# CareerMate

AI-powered career toolkit — Resume Builder, Cover Letter Generator, Cold Email Generator & Mock Interview Quiz.

---

## Prerequisites

- **Python 3.13+**
- **Node.js 18+** & **npm**
- **PostgreSQL** (or a Supabase database URL)

---

## Backend Setup (Django)

```bash
# 1. Navigate to project root
cd careermate

# 2. Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file in the project root with these variables:
#    SECRET_KEY=<your-django-secret-key>
#    DEBUG=True
#    DATABASE_URL=<your-postgresql-connection-string>
#    CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
#    CLOUDINARY_API_KEY=<your-cloudinary-api-key>
#    CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
#    EMAIL_HOST_USER=<your-email>
#    EMAIL_HOST_PASSWORD=<your-email-app-password>
#    GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
#    FRONTEND_URL=http://localhost:3000

# 5. Run migrations
python manage.py migrate

# 6. Create admin user (optional)
python manage.py seed_admin

# 7. Start the backend server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

---

## Frontend Setup (Next.js)

```bash
# 1. Navigate to frontend directory
cd careermate-frontend

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create .env.local file in careermate-frontend/ with:
#    NEXT_PUBLIC_API_URL=http://localhost:8000/api
#    NEXT_PUBLIC_GEMINI_API_KEY=<your-gemini-api-key>
#    NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>

# 4. Start the frontend dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Quick Start (both servers)

Open **two terminals**:

| Terminal | Command |
|----------|---------|
| Terminal 1 (Backend) | `cd careermate && python manage.py runserver` |
| Terminal 2 (Frontend) | `cd careermate/careermate-frontend && npm run dev` |

---

## User Roles

| Role | Access |
|------|--------|
| **Admin** | Approve/reject HR registrations, view platform stats |
| **HR** | Register with approval letter, access HR dashboard after admin approval |
| **Job Seeker** | Resume builder, cover letter, cold email, mock interview |
