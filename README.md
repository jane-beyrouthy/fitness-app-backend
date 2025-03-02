# Fitness App Backend

This is the backend for the **Fitness App**, a RESTful API built with **Node.js** and **Express**. It provides authentication, activity tracking, friend interactions, challenges, and notifications. The app uses **MySQL** as its database.

## 📂 Project Structure

```
fitness-backend/
├── config/
│   └── db.js             # Database connection
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── activityController.js   # Fitness activity tracking
│   ├── postController.js       # User post management
│   ├── friendController.js     # Friend requests and follow system
│   ├── challengeController.js  # Fitness challenges
│   ├── notificationController.js # Notifications management
│   ├── trackController.js      # User activity tracking
│   └── userController.js      # Search users

├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── activityRoutes.js   # Activity tracking routes
│   ├── postRoutes.js       # Post-related routes
│   ├── friendRoutes.js     # Friend system routes
│   ├── challengeRoutes.js  # Challenge-related routes
│   ├── notificationRoutes.js # Notification-related routes
│   ├── trackRoutes.js      # Tracking routes
│   └── userRoutes.js       # Search routes
├── middleware/
│   └── authMiddleware.js   # JWT authentication middleware
├── .env                    # Environment variables
├── index.js                # Main server file
├── package.json            # Dependencies & scripts
```

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/fitness-backend.git
cd fitness-backend
```

### 2️⃣ Install Dependencies

```bash
npm init -y
```

```bash
npm install express cors mysql2 dotenv bcrypt jsonwebtoken
```

### 3️⃣ Configure Environment Variables

Create a **.env** file in the root directory and add:

```ini
PORT=3000
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-secret-key
```

### 4️⃣ Run the Server

```bash
node index.js
```

The server will run on `http://localhost:3000`.

## 🔑 Authentication

- **Register:** `POST /auth/register`
- **Login:** `POST /auth/login`

## 🏃 Activity Tracking

- **Log Activity:** `POST /activity/log`
- **Get Activity Summary:** `GET /track/activities`

## 👥 Friend System

- **Follow a Friend:** `POST /friends/follow`
- **Unfollow a Friend:** `POST /friends/unfollow`
- **Get Friends List:** `GET /friends`

##📢 Social Feed & Posts
- **Like a Post:** `POST /posts/:postID/like`
- **Add a Comment to a Post:** `POST /posts/:postID/comment`
- **Get Posts Feed:** `GET /posts/feed`
- **Get Details of a Speciifc Post:** `GET /posts/:postID/details`
- **Get Comments for a Specific Post:** `GET posts/:postID/comments-list`

## 🏆 Challenges

- **Create Challenge:** `POST /challenges`
- **Join Challenge:** `POST /challenges/:challengeID/join`
- **Complete Challenge:** `POST /challenges/:challengeID/complete`
- **Track Progress:** `POST /challenges/:challengeID/progress`
- **Get Active Challenges:** `GET /challenges/active`

## 🔔 Notifications

- **Get Unread Notifications:** `GET /notifications`
- **Mark Notifications as Read:** `POST /notifications/read`

## 📜 License

This project is **MIT Licensed**.

---

### 👨‍💻 Developed by Your Name

[GitHub](https://github.com/your-username) | [LinkedIn](https://linkedin.com/in/your-profile)
