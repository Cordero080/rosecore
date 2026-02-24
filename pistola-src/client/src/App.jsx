import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SideNav from './components/SideNav/SideNav'
import ChatWidget from './components/ChatWidget/ChatWidget'
import HomePage from './pages/HomePage/HomePage'
import GalleryPage from './pages/GalleryPage/GalleryPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="page-bg" aria-hidden="true" />
        <SideNav />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
          </Routes>
        </div>
        <ChatWidget />
      </div>
    </BrowserRouter>
  )
}

export default App
