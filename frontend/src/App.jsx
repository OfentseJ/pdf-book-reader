import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LibraryPage from "./pages/LibraryPage";
import ReaderPage from "./pages/ReaderPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/reader/:id" element={<ReaderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
