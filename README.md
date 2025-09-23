#📚 PDF Library Web App

A browser-based PDF library that allows users to upload, read, bookmark, and manage PDF books. Built with React for the frontend and IndexedDB for persistent storage.

Features

Upload PDF books from your local computer.

Automatically generate first-page thumbnails for quick previews.

Read PDFs in-browser with page navigation.

Bookmark pages for quick access later.

Remove books from the library.

Search books by name in real-time.

Rename uploaded books for better organization.

Persistent storage with IndexedDB—library state survives page reloads.

Smooth page navigation and responsive UI.

Tech Stack

Frontend: React, TailwindCSS, React Router

PDF Rendering: react-pdf, pdfjs-dist

Storage: IndexedDB (via custom helper functions)

Other Libraries: uuid/crypto for unique IDs

Getting Started
Prerequisites

Node.js ≥ 18.x

npm or yarn

Installation

Clone the repository:

git clone https://github.com/yourusername/pdf-library-app.git
cd pdf-library-app


Install dependencies:

npm install
# or
yarn install

Run Locally
npm run dev
# or
yarn dev


The app will run at http://localhost:5173
 by default.

Project Structure
src/
├─ components/
│  ├─ BookCard.jsx          # Card component for each book
│  └─ PdfViewer.jsx         # PDF reading component
├─ pages/
│  └─ LibraryPage.jsx       # Main library page
├─ utils/
│  ├─ db.js                 # IndexedDB helpers
│  └─ generateThumbnail.js  # PDF thumbnail generator
├─ App.jsx
└─ main.jsx

Usage

Upload a PDF: Click the “+” upload box and select a PDF from your computer.

Read a book: Click the “Open” button on a book card.

Bookmark pages: While reading, click the bookmark button to save the current page.

Remove a book: Click the “Remove” button on a book card.

Rename a book: Click the “Rename” button on a book card and enter a new name.

Search books: Use the search bar at the top of the library page to filter books by name.

Future Enhancements

Page slider for quick navigation.

Multi-page display.

Export/import library data.

Dark mode support.

User accounts to sync library across devices.

License

MIT License © 2025 Your Name
