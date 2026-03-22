import { Component } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SideNav from "./components/SideNav/SideNav";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import HomePage from "./pages/HomePage/HomePage";
import GalleryPage from "./pages/GalleryPage/GalleryPage";
import AmenitiesPage from "./pages/AmenitiesPage/AmenitiesPage";
import AboutPage from "./pages/AboutPage/AboutPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import BeachesPage from "./pages/BeachesPage/BeachesPage";
import ExcursionsPage from "./pages/ExcursionsPage/ExcursionsPage";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: "60px 40px",
            fontFamily: "sans-serif",
            color: "#2c3e50",
          }}
        >
          <h2>Something went wrong.</h2>
          <p>
            Please refresh the page. If the issue continues, contact us
            directly.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-shell">
          <div className="page-bg" aria-hidden="true" />
          <SideNav />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/amenities" element={<AmenitiesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/beaches" element={<BeachesPage />} />
              <Route path="/excursions" element={<ExcursionsPage />} />
            </Routes>
          </div>
          <ChatWidget />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
