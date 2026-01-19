import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import MainContent from './MainContent'

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const openSidebar = () => {
    setSidebarOpen(true)
  }

  console.log('Dashboard sidebar state:', sidebarOpen) // For debugging

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
        openSidebar={openSidebar}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar 
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        
        {/* Main Content Area */}
        <MainContent 
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  )
}

export default Dashboard