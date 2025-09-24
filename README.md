# 📚 PDF Library Web App

A browser-based PDF library that allows users to upload, read, bookmark, and manage PDF books. Built with React for the frontend and IndexedDB for persistent storage.

---

## 🚀 Features

- **Upload PDF books** from your local computer.
- **Automatic thumbnails** generated from the first page for quick previews.
- **In-browser PDF reading** with intuitive page navigation.
- **Bookmark pages** for quick access later.
- **Remove books** from your library at any time.
- **Real-time search** by book name.
- **Rename uploaded books** for better organization.
- **Persistent storage** (IndexedDB)—library state survives page reloads.
- **Responsive UI** and smooth navigation.

---

## 🛠️ Tech Stack

- **Frontend:** React, TailwindCSS, React Router
- **PDF Rendering:** [react-pdf](https://github.com/wojtekmaj/react-pdf), [pdfjs-dist](https://github.com/mozilla/pdfjs-dist)
- **Storage:** IndexedDB (via custom helper functions)
- **Other Libraries:** uuid/crypto for unique IDs

---

## 📦 Installation

### **Prerequisites**

- [Node.js](https://nodejs.org/) ≥ 18.x
- npm or yarn

### **Getting Started**

1. **Clone the repository**

   ```bash
   git clone https://github.com/OfentseJ/pdf-book-reader.git
   cd pdf-book-reader
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run Locally**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   By default, the app will run at [http://localhost:5173](http://localhost:5173).

---

## 🗂️ Project Structure

```
src/
├─ components/
│  ├─ BookCard.jsx          # Card component for each book
│  └─ PdfViewer.jsx         # PDF reading component
├─ pages/
│  └─ LibraryPage.jsx       # Main library page
│  └─ ReaderPage.jsx        # Container for PDF reading component
├─ utils/
│  ├─ db.js                 # IndexedDB helpers
│  └─ generateThumbnail.js  # PDF thumbnail generator
├─ App.jsx
└─ main.jsx
```

---

## ✨ Usage

- **Upload a PDF:** Click the “+” upload box and select a PDF from your computer.
- **Read a book:** Click the “Open” button on a book card.
- **Bookmark pages:** While reading, click the bookmark button to save the current page.
- **Remove a book:** Click the “Remove” button on a book card.
- **Rename a book:** Click the “Rename” button on a book card and enter a new name.
- **Search books:** Use the search bar at the top of the library page to filter books by name.

---

## 🛣️ Roadmap / Future Enhancements

- [ ] Page slider for quick navigation
- [ ] Multi-page display
- [ ] Export/import library data
- [ ] Dark mode support
- [ ] User accounts to sync library across devices

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any feature requests, bug fixes, or improvements.

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## 📄 License

MIT License © 2025 [OfentseJ](https://github.com/OfentseJ)

---

## 🙏 Acknowledgments

- [react-pdf](https://github.com/wojtekmaj/react-pdf)
- [pdfjs-dist](https://github.com/mozilla/pdfjs-dist)
- [TailwindCSS](https://tailwindcss.com/)
- All contributors and open-source libraries

---
