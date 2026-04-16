# 🧩 Trello Clone – Project Management Tool

## 🚀 Overview

This project is a full-stack Kanban-style project management application inspired by Trello. It allows users to visually organize tasks using boards, lists, and cards with smooth drag-and-drop functionality.

The application closely replicates Trello’s UI patterns, layout, and interaction design, enabling efficient workflow management.

---

## 🛠️ Tech Stack

**Frontend:** React.js (Vite)

**Backend:** Node.js + Express.js

**Database:** PostgreSQL (Supabase)

**Drag & Drop:** @hello-pangea/dnd

---

## ✨ Core Features

### 📌 Board Management

* Create and view boards
* Display all lists and cards within a board

### 📋 Lists Management

* Create, edit, and delete lists
* Reorder lists using drag-and-drop

### 📝 Cards Management

* Create cards with title
* Edit card title and description
* Delete cards
* Drag and drop cards between lists
* Reorder cards within a list

### 🔍 Search & Filter

* Search cards by title *(basic implementation)*

---

## ⚡ Additional Features Implemented

* Persistent data using PostgreSQL
* Clean and responsive UI
* Real-time UI updates after actions

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

Create a `.env` file inside the backend folder:

```
DATABASE_URL=your_postgres_connection_string
PORT=5000
```

---

## 🌐 Deployment

* **Frontend:** Vercel
* **Backend:** Render / Railway

---

## 🧠 Database Design

The application uses a relational schema with the following structure:

* **Boards** → contains multiple lists
* **Lists** → belongs to a board and contains multiple cards
* **Cards** → belongs to a list

Relationships:

* One-to-Many: Board → Lists
* One-to-Many: List → Cards

Position fields are used to maintain ordering of lists and cards.

---

## 🤖 AI Tools Usage

AI tools such as ChatGPT and GitHub Copilot were used to:

* Debug issues
* Improve UI and code structure
* Assist with drag-and-drop logic

All code written is understood and can be explained.

---

## 📌 Assumptions

* No authentication (default user assumed)
* Single board system (for simplicity)
* Basic search implemented

---

## 🎯 Future Improvements

* Labels and filtering
* Due dates
* Checklist inside cards
* Assign members to cards
* Multiple boards support
* Comments and activity log
* File attachments
* Mobile responsiveness improvements

---

## 📊 Evaluation Readiness

This project is built keeping in mind:

* Clean and modular code structure
* Smooth drag-and-drop interactions
* Scalable database design
* UI similar to Trello

---

## 🔗 Submission

* GitHub Repository: *(Add your link here)*
* Live Demo: *(Add deployed link here)*

---

## ⏳ Timeline

Completed within the given 2-day assignment window.

---

## 📌 Final Note

This project demonstrates full-stack development skills including frontend UI design, backend API development, database design, and state management with drag-and-drop interactions.
