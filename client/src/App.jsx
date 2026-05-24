import { Component, lazy, Suspense } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SideNav from "./components/SideNav/SideNav";
import ChatWidget from "./components/ChatWidget/ChatWidget";

const HomePage = lazy(() => import("./pages/HomePage/HomePage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage/GalleryPage"));
const AmenitiesPage = lazy(() => import("./pages/AmenitiesPage/AmenitiesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage/ContactPage"));
const BeachesPage = lazy(() => import("./pages/BeachesPage/BeachesPage"));
const ExcursionsPage = lazy(
  () => import("./pages/ExcursionsPage/ExcursionsPage"),
);

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
            <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/amenities" element={<AmenitiesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/beaches" element={<BeachesPage />} />
                <Route path="/excursions" element={<ExcursionsPage />} />
              </Routes>
            </Suspense>
          </div>
          <ChatWidget />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
