# 🔗 URL Shortener

A full-stack URL shortener web application that allows users to generate short links, track usage, and scan QR codes.

## 🚀 Live Demo

* 🌐 Frontend: https://vighnesh-shortener.netlify.app
* ⚙️ Backend: https://url-shortener-z980.onrender.com

---

## ✨ Features

* 🔗 Shorten long URLs
* 🎯 Custom short IDs
* 📊 View click statistics
* 📱 QR code generation
* 🔁 Redirect to original URL
* 📈 Click tracking

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Prisma ORM

### Deployment

* Frontend: Netlify
* Backend: Render

---

## 📁 Project Structure

```
url-shortener/
│── prisma/
│── index.html
│── server.js
│── prisma.js
│── package.json
```

---

## ⚙️ Setup Instructions

### 1. Clone repo

```
git clone https://github.com/your-username/url-shortener.git
cd url-shortener
```

### 2. Install dependencies

```
npm install
```

### 3. Setup environment variables

Create `.env` file:

```
DATABASE_URL=your_database_url
BASE_URL=http://localhost:5000
```

### 4. Run project

```
node server.js
```

---

## 📌 API Endpoints

### POST /shorten

Create short URL

### GET /:shortId

Redirect to original URL

### GET /stats/:shortId

Get analytics

---

## 💡 Future Improvements

* User authentication
* Dashboard UI
* Link expiration
* Rate limiting

---

## 👨‍💻 Author

Vighnesh
