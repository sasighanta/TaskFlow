# 🧩 Trello Clone – Project Management Tool

## 🚀 Overview

This is a full-stack Kanban-style project management application inspired by Trello.
It allows users to organize tasks visually using lists and cards with smooth drag-and-drop functionality.

The application focuses on **real-time UI updates, persistent data storage, and intuitive task management workflows**.

---

## 🔗 Live Links

* 🌐 Frontend: https://trello-tau-amber.vercel.app
* ⚙️ Backend: https://trello-backend-i0lq.onrender.com
* 📂 GitHub: https://github.com/sasighanta/trello

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite)
* **Backend:** Node.js + Express.js
* **Database:** PostgreSQL (Supabase)
* **Drag & Drop:** @hello-pangea/dnd

---

## ✨ Core Features

### 📋 Lists & Cards Management

* Create, delete, and manage lists
* Create, delete, and manage cards
* Drag and drop cards between lists
* Reorder cards within a list

### 🔁 Drag & Drop (Key Feature)

* Implemented using `@hello-pangea/dnd`
* Supports:

  * Moving cards across lists
  * Reordering within lists
* Uses **position-based indexing stored in DB**
* Optimistic UI updates for smooth experience

### 💾 Data Persistence

* All data stored in PostgreSQL (Supabase)
* Ensures state is maintained after refresh

---

## ⚡ Additional Features

* Tag-based card categorization
* Real-time UI updates
* Clean Trello-like interface
* Responsive horizontal scrolling layout

---

## 📂 Project Structure

```
trello-clone/
│
├── frontend/     # React Application
├── backend/      # Express Server
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/trello-clone.git
cd trello-clone
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create `.env` in backend:

```
DATABASE_URL=your_postgres_connection_string
PORT=5000
```

---

## 🧠 Database Design

### Tables:

* **Boards**
* **Lists**
* **Cards**

### Relationships:

* Board → Lists (1:N)
* List → Cards (1:N)

### Key Design Decision:

* `position` field used to maintain order for drag-and-drop
* Ensures correct ordering after re-fetch

---

## 🤖 AI Tools Usage

AI tools like ChatGPT and GitHub Copilot were used for:

* Debugging issues
* Improving drag-and-drop logic
* Enhancing UI/UX

All implemented logic is fully understood and explainable.

---

## 📌 Assumptions

* No authentication (single user)
* Single board implementation
* Basic filtering support

---

## 🚀 Future Improvements

* Labels & filtering system
* Due dates
* Checklist in cards
* Member assignment
* Multiple boards
* Comments & activity logs

---

## 📸 Screenshot

*(Add screenshot of your app here — strongly recommended)*

---

## ⏳ Timeline

Completed within the 2-day assignment window.

---

## 🎯 Final Note

This project demonstrates:

* Full-stack development
* Database design
* State management
* Drag-and-drop interaction handling

Designed to closely replicate real-world task management workflows.
