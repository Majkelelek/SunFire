import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import Admin from './pages/Admin';
import Login from './pages/Login';


function App() {
  useEffect(() => {
  fetch('http://localhost:5150/api/cms')
    .then(res => {
      if (!res.ok) throw new Error("Błąd serwera");
      return res.json();
    })
    .then(data => {
      if (data && data.primaryColor) {
        document.documentElement.style.setProperty('--primary', data.primaryColor);
        document.documentElement.style.setProperty('--dark-bg', data.backgroundColor);
        if (data.backgroundImageUrl) {
          document.body.style.backgroundImage = `url(${data.backgroundImageUrl})`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundAttachment = "fixed";
        }
      }
    })
    .catch(err => console.log("Czekam na konfigurację serwera..."));
}, []);

  return (
    <Router>
      <Navbar />
      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;