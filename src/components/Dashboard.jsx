import { useOutletContext } from 'react-router-dom'
import MainContent from './MainContent'

const Dashboard = () => {
  const { sidebarOpen } = useOutletContext()

  return (
    <MainContent
      sidebarOpen={sidebarOpen}
    />
  )
}

export default Dashboard