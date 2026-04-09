# 🔗 URL Shortener

A scalable full-stack URL shortener that converts long URLs into compact links, supports custom aliases, generates QR codes, and tracks usage analytics.

---

## 🚀 Live Demo

* 🌐 Frontend: https://vighnesh-shortener.netlify.app
* ⚙️ Backend: https://url-shortener-z980.onrender.com

---

## 🧠 Problem Statement

Long URLs are difficult to share, track, and manage.
This project solves that by providing:

* Short, shareable links
* Click tracking & analytics
* QR-based access for mobile users

---

## ✨ Features

* 🔗 URL shortening with unique IDs
* 🎯 Custom aliases support
* 📊 Click analytics & history
* 📱 QR code generation
* 🔁 Instant redirection
* 📈 Scalable ID generation logic

---

## 🏗️ System Design (High Level)

Client (Browser)
⬇️
Frontend (Netlify)
⬇️
Backend API (Render)
⬇️
PostgreSQL Database (Prisma ORM)

---

## ⚙️ Tech Stack

### Frontend

* HTML, CSS, JavaScript

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Prisma ORM

### Deployment

* Netlify (Frontend)
* Render (Backend)

---

## ⚡ Key Engineering Decisions

* Used **Prisma ORM** for type-safe database access
* Implemented **unique ID collision handling**
* Designed **stateless REST APIs**
* Handled **cold-start delays (Render free tier)**
* Structured backend for **scalability and extension**

---

## 📁 Project Structure

url-shortener/
│── prisma/
│── index.html
│── server.js
│── prisma.js
│── package.json

---

## 📌 API Endpoints

### POST /shorten

Create a short URL

### GET /:shortId

Redirect to original URL

### GET /stats/:shortId

Retrieve analytics

---

## ⚙️ Setup Instructions

### 1. Clone repository

git clone https://github.com/your-username/url-shortener.git
cd url-shortener

### 2. Install dependencies

npm install

### 3. Setup environment variables

Create `.env` file:

DATABASE_URL=your_database_url
BASE_URL=http://localhost:5000

### 4. Run server

node server.js

---

## 📈 Future Improvements

* Authentication system (JWT)
* User dashboard
* Link expiration & access control
* Rate limiting & abuse protection
* Caching (Redis) for faster redirects

---

## 👨‍💻 Author

Vighnesh
