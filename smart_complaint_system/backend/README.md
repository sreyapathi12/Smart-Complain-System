# Smart Citizen Grievance Management System

A full-stack web application where citizens register complaints about civic issues (water supply, electricity, roads, drainage, sanitation, street lights, public health) with photo proof. Each complaint is routed to the matching department officer, who updates its status (Pending → In Progress → Resolved) and adds remarks.

**GitHub Repository:** [https://github.com/sreyapathi12/Smart-Complain-System](https://github.com/sreyapathi12/Smart-Complain-System)

## Features
- Citizen registration and login
- Complaint submission with image upload
- Automatic routing to the department officer
- Status tracking and officer remarks
- Officer dashboard with reports and charts
- JWT authentication and password hashing

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript, Bootstrap, Chart.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Security:** JWT, bcryptjs, CORS
- **Other:** Multer, dotenv, Morgan, Nodemon

## How to Run
1. Install Node.js and MongoDB
2. Clone the repository
3. Open the `smart_complaint_system/backend` folder
4. Run `npm install`
5. Create a `.env` file with:
   - PORT=5000
   - MONGO_URI=mongodb://127.0.0.1:27017/smart_grievance_db
   - JWT_SECRET=your_secret_key
   - JWT_EXPIRES_IN=7d
   - CLIENT_URL=http://localhost:5500
6. Run `npm run seed`
7. Run `npm run dev`
8. Open http://localhost:5000

## Author
Sreya Pathi
