# 📚 PDF Book Reader

> A full-stack web application for managing and reading PDF books with cloud sync, offline support, and an intuitive reading experience.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

## 🎯 Live Demo

**🚀 Coming Soon** - Deployment in progress

**Note:** This app uses free-tier hosting. The first load may take 30-60 seconds as the server wakes up from sleep mode.

## 📸 Screenshots

### Login & Authentication

![Login Page](https://via.placeholder.com/800x400/1e293b/60a5fa?text=Login+Page)
_Secure authentication with JWT tokens_

### Library Dashboard

![Library View](https://via.placeholder.com/800x400/1e293b/60a5fa?text=Library+Dashboard)
_Clean, organized view of your PDF collection with search and sorting_

### PDF Reader

![PDF Reader](https://via.placeholder.com/800x400/1e293b/60a5fa?text=PDF+Reader+View)
_Full-featured PDF reader with bookmarks and page navigation_

## ✨ Features

### Core Functionality

- 📤 **Upload & Store** - Upload PDF books with automatic cloud backup
- 🖼️ **Auto Thumbnails** - First page thumbnails generated automatically
- 📖 **In-Browser Reading** - Smooth PDF rendering with page navigation
- 🔖 **Bookmarks** - Save and manage bookmarks for quick access
- ✏️ **Organize** - Rename and delete books from your library
- 🔍 **Search & Sort** - Real-time search with multiple sorting options

### Technical Features

- 💾 **Hybrid Storage** - IndexedDB for offline access + PostgreSQL for cloud sync
- 🔐 **Secure Auth** - JWT-based authentication
- 🐳 **Docker Ready** - Fully containerized with Docker Compose
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast Loading** - Optimized asset loading and caching
- 🌐 **CDN Integration** - PDF.js worker loaded from CDN for better performance

## 🛠️ Tech Stack

### Frontend

- ⚛️ **React 18** - Modern UI library
- ⚡ **Vite** - Lightning-fast build tool
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 📚 **React Router v6** - Client-side routing
- 📄 **react-pdf & PDF.js** - PDF rendering engine
- 💾 **IndexedDB** - Local storage via `idb` library

### Backend

- 🟩 **Node.js & Express** - RESTful API server
- 🗄️ **PostgreSQL** - Relational database
- ☁️ **Cloudinary** - Cloud storage for PDFs
- 🔐 **JWT & bcrypt** - Secure authentication
- 📁 **Multer** - File upload handling

### DevOps

- 🐳 **Docker & Docker Compose** - Containerization
- 🚀 **Render.com** - Cloud deployment
- 🔧 **Nginx** - Production web server

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed
- [Git](https://git-scm.com/) installed

### 1. Clone the Repository

```bash
git clone https://github.com/OfentseJ/pdf-book-reader.git
cd pdf-book-reader
```

### 2. Configure Environment Variables

Create `.env` file in the root directory:

```env
# Backend
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development

# Database
DB_HOST=db
DB_USER=bookreader_user
DB_PASS=bookreader_pass
DB_NAME=bookreader
DATABASE_URL=postgresql://bookreader_user:bookreader_pass@db:5432/bookreader

# Cloudinary (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=5000
```

### 3. Start the Application

```bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **PostgreSQL:** localhost:5432

### 5. Initialize Database (First Time Only)

```bash
# Connect to PostgreSQL container
docker exec -it pdf-book-reader-db-1 psql -U bookreader_user -d bookreader

# Run this SQL:
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  cloudinary_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_users_email ON users(email);

# Exit with \q
```

## 🔧 Manual Setup (Without Docker)

<details>
<summary>Click to expand manual installation steps</summary>

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+

### Backend Setup

```bash
cd backend
npm install

# Configure .env as shown above (use localhost for DB_HOST)
# Create PostgreSQL database manually
# Run the SQL schema from step 5 above

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

</details>

## 📁 Project Structure

```
pdf-book-reader/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookCard.jsx           # Book display card
│   │   │   └── LibraryHeader.jsx      # Library header
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Landing/Auth page
│   │   │   ├── LibraryPage.jsx        # Main library view
│   │   │   └── PdfViewer.jsx          # PDF reader
│   │   ├── utils/
│   │   │   ├── db.js                  # IndexedDB operations
│   │   │   ├── books.js               # API functions
│   │   │   └── generateThumbnail.js   # Thumbnail generation
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/
│   ├── config/
│   │   ├── db.js                      # PostgreSQL connection
│   │   └── cloudinaryConfig.js        # Cloudinary setup
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification
│   ├── routes/
│   │   ├── auth.js                    # Auth endpoints
│   │   ├── books.js                   # Book CRUD
│   │   └── bookActions.js             # Rename/Delete
│   ├── server.js                      # Express app
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🎮 Usage Guide

### 1. **Create an Account**

- Click "Register" on the homepage
- Fill in username, email, and password
- Automatic login after registration

### 2. **Upload a PDF**

- Click the "Add Book" card (+ icon)
- Select a PDF file from your computer
- Thumbnail generates automatically
- Book syncs to cloud and saves locally

### 3. **Read a Book**

- Click "Open" on any book card
- Navigate with arrow keys or buttons
- Use zoom controls for better readability
- Your last page is automatically saved

### 4. **Bookmark Pages**

- While reading, click the bookmark icon
- Add custom labels to bookmarks
- Access bookmarks from the sidebar
- Jump to bookmarked pages instantly

### 5. **Manage Your Library**

- **Search:** Type in the search bar to filter books
- **Sort:** Choose from A-Z, Z-A, Recently Added, Last Opened
- **Rename:** Click the edit icon on a book card
- **Delete:** Click the trash icon to remove a book

### 6. **Offline Access**

- Books you've opened are cached locally
- Read without internet connection
- Changes sync when you're back online

## 🐳 Docker Commands Reference

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Remove all data (including database)
docker-compose down -v

# Access PostgreSQL CLI
docker exec -it pdf-book-reader-db-1 psql -U bookreader_user -d bookreader
```

## 🚀 Deployment to Render.com

<details>
<summary>Click for deployment instructions</summary>

### Prerequisites

- GitHub account
- Render.com account (free)
- Cloudinary account

### 1. Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. New → PostgreSQL
3. Name: `pdf-reader-db`, Free tier
4. Copy the **Internal Database URL**

### 2. Deploy Backend

1. New → Web Service
2. Connect your GitHub repo
3. Settings:
   - **Name:** `pdf-reader-backend`
   - **Root Directory:** `backend`
   - **Environment:** Docker
   - **Dockerfile Path:** `backend/Dockerfile.render`
   - **Plan:** Free
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<paste-internal-database-url>
   JWT_SECRET=<your-secret>
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-key>
   CLOUDINARY_API_SECRET=<your-secret>
   ```
5. Copy the backend URL (e.g., `https://pdf-reader-backend.onrender.com`)

### 3. Deploy Frontend

1. New → Web Service
2. Settings:
   - **Name:** `pdf-reader-frontend`
   - **Root Directory:** `frontend`
   - **Environment:** Docker
   - **Dockerfile Path:** `frontend/Dockerfile.render`
3. Environment Variables:
   ```
   VITE_API_URL=https://pdf-reader-backend.onrender.com/api
   ```

### 4. Initialize Database

Run the SQL schema from "Initialize Database" section above using Render's PostgreSQL dashboard or CLI.

</details>

## 🔐 Security Best Practices

- 🔑 JWT tokens expire after 24 hours
- 🔒 Passwords hashed with bcrypt (10 rounds)
- 🛡️ SQL injection protection via parameterized queries
- 🌐 CORS configured for specific origins
- 🔐 Environment variables for sensitive data
- 📝 Input validation on all endpoints

## 🐛 Troubleshooting

<details>
<summary>Common issues and solutions</summary>

### Docker Issues

**Port already in use:**

```bash
# Change ports in docker-compose.yml or .env
FRONTEND_PORT=3001
BACKEND_PORT=5001
```

**Database connection failed:**

```bash
# Wait for database to be ready
docker-compose up db
# Then start other services
docker-compose up
```

### PDF Worker MIME Type Error

If you see "Failed to load module script" errors:

- The app now uses CDN for PDF.js worker
- Clear browser cache and hard reload (Ctrl+Shift+R)
- Check Network tab - worker should load from `cdnjs.cloudflare.com`

### Authentication Issues

**"Invalid credentials" on login:**

- Ensure database is initialized with user table
- Check JWT_SECRET is set in environment
- Verify email/password are correct

### Upload Issues

**File upload fails:**

- Check Cloudinary credentials in .env
- Verify file size is under limit (usually 10MB)
- Check backend logs: `docker-compose logs backend`

</details>

## 🛣️ Roadmap

- [ ] 🌙 Dark/Light theme toggle
- [ ] 📊 Reading statistics and progress tracking
- [ ] 🏷️ Tags and categories for organization
- [ ] 📤 Export/Import library data
- [ ] 🔄 Real-time sync across devices
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🎯 Page slider for quick navigation
- [ ] 📝 Highlight and annotation features
- [ ] 👥 Shared libraries and collaboration

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to your branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ofentse J**

- GitHub: [@OfentseJ](https://github.com/OfentseJ)
- Portfolio: [Vist](https://ofentsej.github.io/react-personal-portfolio/)

## 🙏 Acknowledgments

- [react-pdf](https://github.com/wojtekmaj/react-pdf) - PDF rendering for React
- [PDF.js](https://github.com/mozilla/pdf.js) - Mozilla's PDF rendering engine
- [Cloudinary](https://cloudinary.com/) - Cloud storage solution
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Browser storage
- [Lucide Icons](https://lucide.dev/) - Beautiful icon library

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [OfentseJ](https://github.com/OfentseJ)

</div>
