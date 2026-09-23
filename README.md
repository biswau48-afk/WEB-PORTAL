# Fortune Coaching Center Backend

This is a complete starter backend for the Fortune Coaching Center Result, Attendance and Notice portal.

## Technology
- Node.js
- Express
- SQLite (stored locally in `fortune.db`)
- Express Session
- HTML/CSS/JavaScript frontend

## Run locally

1. Install Node.js (LTS).
2. Open a terminal in this folder.
3. Run:
   `npm install`
4. Start:
   `npm start`
5. Open:
   `http://localhost:3000`

## Demo admin
Username: `admin`
Password: `admin123`

Demo student IDs:
- FCC-1001
- FCC-1002
- FCC-1003

## Important before production
- Change the admin password and session secret.
- Use HTTPS.
- Add proper password hashing (bcrypt/argon2).
- Add validation, CSRF protection, rate limiting and audit logs.
- Back up the database.
- For a multi-server deployment, move from local SQLite to MySQL/PostgreSQL.
- Do not publish the demo credentials.

## API
GET `/api/results/:studentId?exam=...`
GET `/api/attendance/:studentId?month=YYYY-MM`
GET `/api/notices`

POST `/api/admin/login`
POST `/api/admin/students`
POST `/api/admin/results`
POST `/api/admin/attendance`
POST `/api/admin/notices`
DELETE `/api/admin/students/:id`
DELETE `/api/admin/notices/:id`
