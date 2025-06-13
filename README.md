# Hospital Management App

A multi-level hospital management system for patient case records, psycho-social assessments, OPD/teleconsultation, and appointment scheduling. Built with Node.js, Express, MongoDB, and EJS.

---

## Features

- **Multi-level Forms:**  
  - **Level 1:** Patient demographic and medical case record.
  - **Level 2:** Psycho-social assessment linked to Level-1 patients.
  - **Level 3:** OPD/Teleconsultation records linked to Level-1 patients.
- **Role-based Dashboards:**  
  - Level 1, 2, and 3 users have separate dashboards and permissions.
- **Admin Panel:**  
  - Manage users, view login/logout history, and session durations.
- **Appointment Booking & Management:**  
  - Book, view, reschedule, and cancel appointments.
  - Prevent double-booking and enforce office hours.
- **Reporting:**  
  - Filter Level-1 patient records by area, sex, diagnosis, and deceased status.
- **Session Management:**  
  - Secure sessions with MongoDB-backed store.
  - Prevents back navigation after logout.
- **Responsive UI:**  
  - Mobile-friendly, Bootstrap-based design.
- **Security:**  
  - Session-based authentication.
  - Admin PIN login for admin dashboard.

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Frontend:** EJS templates, Bootstrap 5
- **Session Store:** connect-mongo
- **Calendar:** FullCalendar.js

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB instance (local or cloud)
- npm

### Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd amrit-dhara
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory:

   ```
   MONGO_URI=mongodb://localhost:27017/amritdhara
   SESSION_SECRET=your-session-secret
   PORT=3000
   ```

4. **Initialize Admin PIN:**
   ```sh
   npm run init-admin
   ```
   This sets the admin PIN to `123456` (change in `scripts/initAdmin.js` as needed).

5. **Start the server:**
   ```sh
   npm run dev
   ```
   or
   ```sh
   npm start
   ```

6. **Access the app:**
   - User login: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
   - Admin login: [http://localhost:3000/auth/admin-login](http://localhost:3000/auth/admin-login)

---

## Usage

### User Roles

- **Level 1:** Can create/edit Level-1 forms, view Level-3 forms, book appointments.
- **Level 2:** Can create Level-2 forms, view Level-1/2 forms, book appointments.
- **Level 3:** Can create Level-3 forms, view all forms, manage appointments, access reports.

### Admin

- Login with PIN (default: `123456`).
- Create/delete users, view login/logout/session history.

### Appointments

- Book appointments for Level-1 registered patients.
- Only available during office hours (9:00 AM - 5:00 PM).
- Prevents double-booking within 15 minutes for the same doctor.
- Level-3 users can view, reschedule, and cancel appointments.

### Reports

- Level-3 users can filter Level-1 patient records by area, sex, diagnosis, and deceased status.

---

## Project Structure

```
amrit-dhara/
├── app.js
├── models/
│   ├── Admin.js
│   ├── Appointment.js
│   ├── Form.js
│   └── User.js
├── routes/
│   ├── admin.js
│   ├── appointments.js
│   ├── auth.js
│   └── forms.js
├── scripts/
│   ├── createTestUser.js
│   └── initAdmin.js
├── views/
│   ├── admin/
│   ├── appointments/
│   ├── forms/
│   └── ...
├── public/
│   └── js/
├── package.json
└── .env
```

---

## Development

- **Hot reload:**  
  Use `npm run dev` for automatic server restarts on file changes.
- **Add test users:**  
  Use `npm run create-test-user` or modify `scripts/createTestUser.js`.

---

## Deployment

- **Vercel:**  
  Includes `vercel.json` for deployment as a serverless function.
- **Environment variables:**  
  Set `MONGO_URI` and `SESSION_SECRET` in your deployment environment.

---

## Security Notes

- Change the default admin PIN after first use.
- Use strong session secrets and secure MongoDB credentials.
- For production, set `cookie.secure: true` in `app.js` and use HTTPS.

---

## License

MIT License

---

## Acknowledgements

- [Bootstrap](https://getbootstrap.com/)
- [FullCalendar](https://fullcalendar.io/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
