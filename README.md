# 📚 PDF Library Web App

A browser-based PDF library that allows users to upload, read, bookmark, and manage PDF books. Built with React on the frontend and Node.js + MySQL on the backend. PDFs are stored in Cloudinary, and IndexedDB is used for local persistence and offline access.

## 🚀 Features

* 📤 Upload PDF books from your computer
* 🖼️ Automatic thumbnails generated from the first page
* 📖 Read PDFs in-browser with page navigation
* 🔖 Bookmark pages for later access
* 🧹 Delete books from your library
* ✏️ Rename uploaded books for better organization
* 🔍 Real-time search by book name
* 💾 Hybrid storage: IndexedDB for offline access + Cloudinary/MySQL for cloud sync
* 📱 Responsive UI — works great on desktop and mobile

## 🛠️ Tech Stack

### Frontend
* ⚛️ React (Vite)
* 🎨 TailwindCSS
* 📚 React Router
* 🧩 react-pdf
* 🧠 pdfjs-dist
* 💾 IndexedDB (via idb library)

### Backend
* 🟩 Node.js + Express
* 🗄️ MySQL (via XAMPP)
* ☁️ Cloudinary for PDF storage
* 🔐 JWT Authentication
* 📁 Multer for file uploads

## ⚙️ Environment Variables

Create a `.env` file in the root of your backend directory and configure it like this:
```env
PORT=8000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=pdf_reader
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/OfentseJ/pdf-book-reader.git
cd pdf-book-reader
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Make sure XAMPP's MySQL service is running, then create a database named `pdf_reader` and run any necessary migrations.

Start your backend server:
```bash
npm run dev
```

By default, it runs on: http://localhost:8000

### 3. Setup Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

By default, the app runs at: http://localhost:5173

## 🗂️ Project Structure
```
pdf-book-reader/
│
├── backend/
│   ├── config/
│   │   ├── db.js                   # MySQL connection setup
│   │   └── cloudinaryConfig.js     # Cloudinary configuration
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   └── books.js                # Book management API routes
│   └── server.js                   # Express app entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── BookCard.jsx        # Book display component
    │   │   └── PdfViewer.jsx       # PDF rendering component
    │   ├── pages/
    │   │   ├── LibraryPage.jsx     # Main library view
    │   │   └── ReaderPage.jsx      # PDF reader page
    │   ├── utils/
    │   │   ├── db.js               # IndexedDB operations
    │   │   ├── books.js            # API functions
    │   │   └── generateThumbnail.js
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

## ✨ Usage

1. **Register/Login** → Create an account or login with existing credentials
2. **Upload a PDF** → Click the "+" icon and select a file
3. **Read a Book** → Click "Open" on a book card
4. **Bookmark Pages** → While reading, click the bookmark icon
5. **Rename / Delete Books** → Use the menu buttons on each card
6. **Search** → Use the search bar to filter by name
7. **Offline Access** → Books are cached locally in IndexedDB for offline reading

## 🧩 Example Flow

1. You upload a PDF → it's stored in Cloudinary
2. The book metadata is saved in MySQL with user association
3. The book is cached in IndexedDB for offline access
4. A thumbnail is generated from the first page
5. When reloading, books sync from backend and merge with local cache
6. Books can be read offline if previously opened

## 🛣️ Roadmap / Future Enhancements

* 🌙 Dark Mode support
* 📤 Export/Import library data
* 📄 Multi-page reading view
* 🔄 Improved sync between devices
* 🎯 Page slider navigation
* 📊 Reading statistics and progress tracking
* 🏷️ Tags and categories for better organization

## 🤝 Contributing

Contributions are welcome!

1. Fork this repo
2. Create your branch:
```bash
git checkout -b feature/my-feature
```
3. Commit your changes:
```bash
git commit -am "Add my feature"
```
4. Push to your branch:
```bash
git push origin feature/my-feature
```
5. Open a Pull Request

## 📄 License

MIT License © 2025 OfentseJ

## 🙏 Acknowledgments

* [react-pdf](https://github.com/wojtekmaj/react-pdf)
* [pdfjs-dist](https://github.com/mozilla/pdf.js)
* [Cloudinary](https://cloudinary.com/)
* [TailwindCSS](https://tailwindcss.com/)
* [MySQL](https://www.mysql.com/)
* [idb](https://github.com/jakearchibald/idb)
* All open-source contributors 💙
