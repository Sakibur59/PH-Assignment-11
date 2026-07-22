# 🌟 CrowdFund - Crowdfunding Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Node.js-22-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-lightgrey?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Better--Auth-Authentication-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38BDF8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

---

# 🌍 About CrowdFund

CrowdFund is a modern crowdfunding platform that empowers individuals, startups, charities, and organizations to raise funds efficiently through a secure and transparent online environment.

The platform creates a bridge between **Creators**, who launch fundraising campaigns, and **Supporters**, who contribute credits to help bring ideas, projects, or social initiatives to life.

With secure authentication, campaign approval workflows, payment management, notifications, and role-based dashboards, CrowdFund provides a complete ecosystem for managing crowdfunding activities.

Whether you're raising funds for a startup, a personal cause, education, healthcare, technology, or community development, CrowdFund offers an intuitive and reliable experience from campaign creation to successful funding.

---

---

# 🚀 Live Demo

### 🌐 Client
```
https://your-client.vercel.app
```

### 🔗 Server
```
https://your-server.onrender.com
```

---

# 📖 Overview

CrowdFund is a modern crowdfunding platform where creators can launch fundraising campaigns and supporters can contribute securely using platform credits.

The platform provides secure authentication, campaign approval workflow, credit purchasing, withdrawal requests, payment tracking, notifications, and role-based dashboards.

The system supports three user roles:

- 👤 Supporter
- 🎯 Creator
- 👑 Admin

---

# 📑 Table of Contents

- Overview
- Features
- Tech Stack
- Project Structure
- Installation
- Environment Variables
- Database Collections
- API Routes
- Authentication
- User Roles
- Dashboard
- Payment System
- Notification System
- Deployment
- Future Improvements
- Screenshots
- Contributing
- License
- Author

---

# ✨ Features

## 🔐 Authentication

- Email & Password Login
- Google OAuth Login
- Better-Auth Authentication
- Secure Session Management
- Protected Routes
- Role-Based Authorization

---

## 👤 User Roles

### 👨 Supporter

- Browse Campaigns
- Search Campaigns
- View Campaign Details
- Purchase Credits
- Support Campaign
- Contribution History
- Payment History
- Report Campaign

---

### 🎯 Creator

- Create Campaign
- Edit Campaign
- Delete Campaign
- Campaign Analytics
- Withdrawal Request
- Payment History
- Manage Contributions

---

### 👑 Admin

- Dashboard Analytics
- Manage Users
- Manage Campaigns
- Approve Campaigns
- Reject Campaigns
- Handle Reports
- Manage Withdraw Requests
- Platform Statistics

---

# 💰 Core Features

- Credit Purchase System
- Campaign Approval Workflow
- Contribution Management
- Withdrawal System
- Notification System
- Payment Tracking
- Campaign Reports
- Search & Filter
- Campaign Categories
- User Profile
- Dashboard Analytics
- Responsive Design

---

# 🛠 Tech Stack

## Frontend

- Next.js 16
- React
- Tailwind CSS
- Lucide React
- Better-Auth Client
- Axios
- React Hook Form

---

## Backend

- Node.js
- Express.js
- MongoDB
- Better-Auth
- JWT
- Stripe (Optional)

---

## Database

- MongoDB Atlas
- MongoDB Compass

---

## Tools

- Git
- GitHub
- VS Code
- Nodemon
- Dotenv
- Postman

---

# 📁 Project Structure

```text
crowdfunding/

│
├── client/
│   ├── src/
│   │
│   ├── app/
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── dashboard/
│   │   ├── api/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── home/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── NotificationBell.jsx
│   │   └── Toast.jsx
│   │
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   └── lib/
│
├── server/
│
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── models/
│   ├── auth.js
│   ├── db.js
│   ├── index.js
│   └── utils/
│
├── screenshots/
├── README.md
└── docker-compose.yml
```

---

---

# 💻 Installation Guide

Follow the steps below to set up the project on your local machine.

## 📌 Prerequisites

Before getting started, make sure the following software is installed on your computer.

- Node.js (v18 or higher)
- npm or Yarn
- Git
- MongoDB Atlas or Local MongoDB
- VS Code (Recommended)

You can verify the installation by running:

```bash
node -v
npm -v
git --version
```

---

## 📥 Clone Repository

Clone the project from GitHub.

```bash
git clone https://github.com/yourusername/crowdfund.git
```

Move into the project folder.

```bash
cd crowdfund
```

---

# 📦 Install Dependencies

## Backend

```bash
cd server
npm install
```

This will install all required backend packages including:

- Express
- MongoDB Driver
- Better Auth
- Dotenv
- CORS
- Cookie Parser
- Stripe (Optional)

---

## Frontend

```bash
cd client
npm install
```

This installs

- Next.js
- React
- Tailwind CSS
- Better Auth Client
- Axios
- Lucide React
- React Hook Form
- React Hot Toast

---

# ⚙ Environment Variables

## Server (.env)

Create a **.env** file inside the server folder.

```env
PORT=5000

CLIENT_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string

DB_NAME=crowdfund

BETTER_AUTH_SECRET=your_super_secret_key

BETTER_AUTH_URL=http://localhost:5000

GOOGLE_CLIENT_ID=your_google_client_id

GOOGLE_CLIENT_SECRET=your_google_client_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

## Client (.env.local)

Create **.env.local** inside the client folder.

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000

NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

---

# ▶ Running the Project

### Start Backend

```bash
cd server

npm run dev
```

or

```bash
nodemon index.js
```

Backend will run on

```
http://localhost:5000
```

---

### Start Frontend

```bash
cd client

npm run dev
```

Frontend will run on

```
http://localhost:3000
```

---

# 🗄 Database Collections

The application uses MongoDB to store all application data.

## users

Stores user profile information.

Fields

- _id
- name
- email
- image
- role
- credits
- status
- createdAt

---

## campaigns

Stores campaign information.

Fields

- _id
- creatorId
- title
- description
- category
- image
- goalAmount
- raisedAmount
- deadline
- status
- supporters
- createdAt

---

## contributions

Stores all campaign contributions.

Fields

- _id
- campaignId
- supporterId
- credits
- message
- status
- createdAt

---

## payments

Stores successful payment history.

Fields

- _id
- userId
- amount
- credits
- transactionId
- paymentMethod
- paymentStatus
- createdAt

---

## withdrawals

Stores creator withdrawal requests.

Fields

- _id
- creatorId
- campaignId
- amount
- status
- approvedBy
- createdAt

---

## notifications

Stores notifications for every user.

Fields

- _id
- receiverId
- title
- message
- type
- isRead
- createdAt

---

## reports

Stores reported campaigns.

Fields

- _id
- campaignId
- reportedBy
- reason
- status
- createdAt

---

# 🔌 REST API Routes

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User Login |
| POST | /api/auth/register | User Registration |
| POST | /api/auth/logout | Logout |

---

## Campaigns

| Method | Endpoint |
|--------|----------|
| GET | /campaigns |
| GET | /campaigns/:id |
| POST | /campaigns |
| PATCH | /campaigns/:id |
| DELETE | /campaigns/:id |

---

## Credits

| Method | Endpoint |
|--------|----------|
| POST | /credits/purchase |
| GET | /credits/history |

---

## Contributions

| Method | Endpoint |
|--------|----------|
| POST | /contributions |
| GET | /contributions/history |

---

## Withdrawals

| Method | Endpoint |
|--------|----------|
| POST | /withdraw |
| GET | /withdraw/history |
| PATCH | /withdraw/:id |

---

## Notifications

| Method | Endpoint |
|--------|----------|
| GET | /notifications |
| PATCH | /notifications/read |

---

## Reports

| Method | Endpoint |
|--------|----------|
| POST | /reports |
| GET | /reports |

---

# 🔐 Authentication Flow

The application uses **Better Auth** for secure authentication and session management.

Authentication features include:

- Email & Password Login
- Google OAuth Login
- Session-based Authentication
- Secure Cookies
- Protected API Routes
- Role-based Authorization
- Automatic Session Validation
- Persistent Login
- Logout from All Devices (Optional)

Authentication workflow:

```text
User Login/Register
        │
        ▼
 Better Auth
        │
        ▼
 Session Created
        │
        ▼
 Role Verification
        │
        ▼
 Protected Dashboard
```

---

---

# 👥 User Roles

CrowdFund provides a secure **Role-Based Access Control (RBAC)** system to ensure that every user can access only the features and resources assigned to their role.

There are three primary user roles within the platform.

---

## 👤 Supporter

Supporters are users who discover and financially support crowdfunding campaigns.

### Features

- Register & Login
- Browse All Campaigns
- Search Campaigns
- Filter by Category
- View Campaign Details
- Purchase Credits
- Support Campaigns
- Track Contribution History
- View Payment History
- Manage Profile
- Receive Notifications
- Report Fraudulent Campaigns

---

### Supporter Workflow

```text
Register/Login
      │
      ▼
Browse Campaigns
      │
      ▼
Purchase Credits
      │
      ▼
Support Campaign
      │
      ▼
Contribution Recorded
      │
      ▼
Receive Notification
```

---

## 🎯 Creator

Creators are responsible for creating and managing crowdfunding campaigns.

### Features

- Create Campaign
- Edit Campaign
- Delete Campaign
- Upload Campaign Image
- Set Funding Goal
- Track Raised Amount
- View Campaign Analytics
- Receive Contributions
- Withdraw Earnings
- View Withdrawal History
- Receive Notifications

---

### Creator Workflow

```text
Login
   │
   ▼
Create Campaign
   │
   ▼
Admin Review
   │
   ▼
Campaign Approved
   │
   ▼
Receive Contributions
   │
   ▼
Withdraw Funds
```

---

## 👑 Admin

Administrators have complete control over the platform.

### Features

- Dashboard Analytics
- Manage Users
- Manage Campaigns
- Approve Campaigns
- Reject Campaigns
- Suspend Users
- View Reports
- Manage Withdraw Requests
- Platform Statistics
- Notification Management

---

### Admin Workflow

```text
Admin Login
      │
      ▼
Dashboard
      │
      ▼
Review Campaign
      │
      ▼
Approve / Reject
      │
      ▼
Manage Platform
```

---

# 📊 Dashboard Features

Each role has a dedicated dashboard designed to simplify daily activities.

---

## 👤 Supporter Dashboard

### Available Pages

- Dashboard Overview
- Browse Campaigns
- My Contributions
- Purchase Credits
- Payment History
- Notifications
- Profile Settings

---

### Dashboard Cards

- Total Credits
- Total Contributions
- Supported Campaigns
- Payment Summary

---

## 🎯 Creator Dashboard

### Available Pages

- Dashboard Overview
- Add Campaign
- My Campaigns
- Campaign Statistics
- Withdraw Funds
- Withdrawal History
- Payment History
- Notifications
- Profile

---

### Dashboard Cards

- Total Campaigns
- Active Campaigns
- Total Raised
- Pending Withdrawals
- Available Balance
- Total Supporters

---

## 👑 Admin Dashboard

### Available Pages

- Dashboard Overview
- Manage Users
- Campaign Management
- Reports
- Withdrawal Requests
- Platform Analytics
- Notifications

---

### Dashboard Cards

- Total Users
- Total Campaigns
- Active Campaigns
- Pending Approvals
- Total Revenue
- Total Withdrawals

---

# 💳 Payment System

CrowdFund uses a **Credit-Based Payment System**.

Instead of directly supporting campaigns with money, users purchase platform credits and use those credits to contribute to campaigns.

---

## Credit Conversion

```text
10 Credits = $1.00
```

Example

| Credits | USD |
|----------|-----|
| 100 | $10 |
| 250 | $25 |
| 500 | $50 |
| 1000 | $100 |

---

## Payment Flow

```text
Purchase Credits
        │
        ▼
Payment Gateway
        │
        ▼
Payment Successful
        │
        ▼
Credits Added
        │
        ▼
Support Campaign
```

---

## Supported Payment Methods

- Stripe
- Visa
- MasterCard
- American Express
- Google Pay *(Optional)*
- Apple Pay *(Optional)*

---

# 🔔 Notification System

The platform provides real-time notifications to keep users informed.

Notifications are generated whenever important activities occur within the platform.

Examples include:

- Campaign Approved
- Campaign Rejected
- New Contribution
- Credit Purchase Successful
- Withdrawal Approved
- Withdrawal Rejected
- Admin Announcement
- New Report Status
- Payment Successful

---

# 🚀 Deployment

## Frontend Deployment (Vercel)

```bash
npm run build
```

Deploy the client application to **Vercel**.

Required Environment Variables:

```env
NEXT_PUBLIC_SERVER_URL=
NEXT_PUBLIC_CLIENT_URL=
NEXT_PUBLIC_IMGBB_API_KEY=
```

---

## Backend Deployment (Render)

```bash
npm start
```

Required Environment Variables:

```env
PORT=
CLIENT_URL=
MONGODB_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
```

---

# 📸 Screenshots

Add screenshots after completing the project.

```
screenshots/

home.png

login.png

register.png

campaigns.png

campaign-details.png

supporter-dashboard.png

creator-dashboard.png

admin-dashboard.png

payment.png

notifications.png
```

---

# 🧪 Future Improvements

- 🤖 AI Campaign Recommendation
- 💬 Real-Time Chat
- 📱 Progressive Web App (PWA)
- 🌙 Dark Mode
- 🌍 Multi-language Support
- 📈 Advanced Analytics
- 📊 Campaign Prediction
- 🏆 Creator Badge System
- 🎁 Reward-Based Campaigns
- 🔐 Two-Factor Authentication
- 📧 Email Notifications
- 📲 Mobile Application

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository.

2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Added new feature"
```

4. Push your branch.

```bash
git push origin feature/your-feature
```

5. Create a Pull Request.

Please ensure that your code follows the project coding standards and is properly tested before submitting.

---

# 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project for educational and personal purposes.

See the LICENSE file for additional information.

---

# 🙏 Acknowledgements

Special thanks to the open-source community and the amazing technologies that made this project possible.

- Next.js
- React
- Node.js
- Express.js
- MongoDB
- Better Auth
- Tailwind CSS
- Stripe
- Lucide React

---

# 👨‍💻 Author

## Md Sakibur Rahman

**MERN Stack Developer**

Passionate about building modern, scalable, and user-friendly full-stack web applications using the MERN ecosystem and Next.js. I enjoy solving real-world problems through clean architecture, intuitive UI/UX, and secure backend systems.

### 📬 Contact

- 📧 Email: sakiburrahman5978@gmail.com
- 💻 GitHub: https://github.com/Sakibur59
- 💼 LinkedIn: https://www.linkedin.com/in/md-sakibur-rahman-54b5bb371
- 🌐 Portfolio: https://sakiburrahman-portfolio.vercel.app

---

<div align="center">

## ⭐ If you found this project helpful, consider giving it a star!

### Made with ❤️ by **Md Sakibur Rahman**

© 2026 Md Sakibur Rahman. All Rights Reserved.

</div>