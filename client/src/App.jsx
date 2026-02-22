import './App.css'
import SideNav from './components/SideNav/SideNav'
import Hero from './components/Hero/Hero'
import AvailabilityCalendar from './components/AvailabilityCalendar/AvailabilityCalendar'
import ChatWidget from './components/ChatWidget/ChatWidget'

function App() {
  return (
    <div className="app-shell">
      <SideNav />
      <div className="app-content">
        <Hero />
        <section id="availability">
          <AvailabilityCalendar />
        </section>
      </div>
      <ChatWidget />
    </div>
  )
}

export default App
