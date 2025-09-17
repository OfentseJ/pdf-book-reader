import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LibraryPage from "./pages/LibraryPage";
import ReaderPage from "./pages/ReaderPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/reader/:id" element={<ReaderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
