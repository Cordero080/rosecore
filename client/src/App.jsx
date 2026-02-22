import './App.css'
import SideNav from './components/SideNav/SideNav'
import Hero from './components/Hero/Hero'
import SectionDivider from './components/SectionDivider/SectionDivider'
import AvailabilityCalendar from './components/AvailabilityCalendar/AvailabilityCalendar'
import ChatWidget from './components/ChatWidget/ChatWidget'

function App() {
  return (
    <div className="app-shell">
      <SideNav />
      <div className="app-content">
        <Hero />
        <SectionDivider />
        <section id="availability">
          <AvailabilityCalendar />
        </section>
      </div>
      <ChatWidget />
    </div>
  )
}

export default App
