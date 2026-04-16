# Fullstack Trello Clone: React (Vite), Node.js, Express, PostgreSQL (Supabase), Drag & Drop

---

## LIVE DEMO

**Frontend (Vercel):**  
https://trello-tau-amber.vercel.app  

**Backend (Render):**  
https://trello-backend-i0lq.onrender.com  

**GitHub Repo:**  
https://github.com/sasighanta/trello  

---

## 1) Overview

This project is a full-stack Kanban-style project management application inspired by Trello. It allows users to visually organize tasks using boards, lists, and cards with smooth drag-and-drop functionality.

The application closely replicates Trello’s UI patterns, layout, and interaction design, enabling efficient workflow management.

---

## 2) Tech Stack

- **Frontend:** React.js (Vite)  
- **Backend:** Node.js + Express.js  
- **Database:** PostgreSQL (Supabase)  
- **Drag & Drop:** @hello-pangea/dnd  

---

## 3) Core Features

### Board Management
- Create and view boards  
- Display all lists and cards within a board  

### Lists Management
- Create, edit, and delete lists  
- Reorder lists using drag-and-drop  

### Cards Management
- Create cards with title  
- Edit card title and description  
- Delete cards  
- Drag and drop cards between lists  
- Reorder cards within a list  

---

## 4) Additional Features

- Persistent data using PostgreSQL  
- Clean and responsive UI  
- Real-time UI updates after actions  

---

## 5) Setup Instructions

### Backend Setup
-cd backend
-npm install
-npm run dev

### Frontend Setup
-cd frontend
-npm install
-npm run dev


---

## 6) Deployment

- Frontend: Vercel  
- Backend: Render / Railway  

---

## 7) Database Design

The application uses a relational schema with the following structure:

- **Boards** → contains multiple lists  
- **Lists** → belongs to a board and contains multiple cards  
- **Cards** → belongs to a list  

Relationships:

- One-to-Many: Board → Lists  
- One-to-Many: List → Cards  

Position fields are used to maintain ordering of lists and cards.

---

## 8) Future Improvements

- Labels and filtering  
- Due dates  
- Checklist inside cards  
- Assign members to cards  
- Multiple boards support  
- Comments and activity log  
- File attachments  
- Mobile responsiveness improvements  

---

## 10) Final Note

This project demonstrates full-stack development skills including frontend UI design, backend API development, database design, and state management with drag-and-drop interactions.
