# Event Booking Backend

## Setup Instructions

### 1. Create .env file
Create a `.env` file in the backend directory with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://127.0.0.1:27017/eventbooking
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Server Configuration
PORT=5000

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sugiradigne@gmail.com
SMTP_PASS=ENTER_YOUR_16_CHARACTER_APP_PASSWORD_HERE
SMTP_FROM=sugiradigne@gmail.com
```

### 2. Get Gmail App Password
1. Go to your Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate app password
4. Select "Mail" and generate
5. Copy the 16-character password (like: abcd efgh ijkl mnop)
6. Replace `ENTER_YOUR_16_CHARACTER_APP_PASSWORD_HERE` in .env with this password

### 3. Start MongoDB
Make sure MongoDB is running on your system:
- Windows: Start MongoDB service or run `mongod`
- Or use MongoDB Atlas (cloud)

### 4. Run the server
```bash
npm run dev
```

The server will start on http://localhost:5000

## Features
- User registration/login with JWT
- Event CRUD operations
- Booking system with seat management
- Email notifications:
  - Welcome email on registration
  - Contact form emails
  - Event ticket emails

