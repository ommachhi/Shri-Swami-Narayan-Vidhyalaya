# Shri Swami Narayana Vidhyalaya - Result Management System

A production-ready MERN Stack application designed for Shri Swami Narayana Vidhyalaya to manage student results securely. The system allows administrators to bulk upload results via Excel, while parents can securely view their child's result using OTP authentication via email.

## 🚀 Features

### Admin Portal
* **Secure Login**: JWT-based authentication for administrators.
* **Dashboard**: Overview of total students, pass/fail statistics, and academic years.
* **Bulk Upload**: Import student marks using an `.xlsx` file.
* **Auto Calculation**: Automatic generation of Total, Percentage, Grade, and Result Status based on predefined rules.
* **Student Management**: View, search, and delete student records.
* **Result Control**: Publish or unpublish results.

### Parent Portal
* **OTP Verification**: Secure 6-digit OTP sent via Nodemailer to the parent's registered email address.
* **Secure Result Viewing**: Parents can only access their child's result.
* **Result Page**: Displays school branding, student details, marks table, and final result.
* **PDF Download**: Automatically generated PDF with School Logo, Details, and Principal Signature area.
* **Print Result**: Native browser print support optimized for A4 sheets.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), Tailwind CSS, React Router DOM, Axios, React Hook Form, React Hot Toast
* **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, Multer, XLSX, Nodemailer, PDFKit
* **Design**: Modern, Premium, Glassmorphism UI (White, Blue, Navy theme)

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository_url>
cd Shri-Swami-Narayana-Vidhyalaya
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure the variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=ommachhi4351@gmail.com
EMAIL_PASS=your_google_app_password
```
*(Use an App Password generated from your Google Account for `EMAIL_PASS`)*

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Start the frontend development server:
```bash
npm run dev
```

---

## 📁 Excel Upload Format

Ensure your `.xlsx` file contains the following columns for successful import:
* `Roll Number`
* `Student Name`
* `Parent Name`
* `Mobile Number`
* `Parent Email`
* `Date Of Birth`
* `Gujarati`
* `English`
* `Mathematics`
* `Science`
* `Social Science`

---

## 🔒 Default Admin Credentials

* **Email:** admin@ssnv.edu.in
* **Password:** Admin@123

*(Please change the password from the settings panel after your first login in production).*

---

## 🚀 Deployment Instructions

### Backend (Render / Heroku)
1. Push your repository to GitHub.
2. Connect the repository to your hosting provider (e.g., Render).
3. Set the Root Directory to `server`.
4. Set the build command to `npm install` and start command to `node server.js`.
5. Add the Environment Variables (`MONGO_URI`, `JWT_SECRET`, etc.).

### Frontend (Vercel / Netlify)
1. Connect the repository to Vercel/Netlify.
2. Set the Root Directory to `client`.
3. Set the build command to `npm run build`.
4. The publish directory should be `dist`.
5. Add an environment variable `VITE_API_URL` pointing to your deployed backend URL.

---

## 👨‍💻 Developed By
**Google Deepmind Agentic Coding Team / Antigravity**
