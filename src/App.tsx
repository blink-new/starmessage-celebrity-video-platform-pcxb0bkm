import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'

// Pages
import HomePage from './pages/HomePage'
import BrowsePage from './pages/BrowsePage'
import CelebrityProfilePage from './pages/CelebrityProfilePage'
import RequestVideoPage from './pages/RequestVideoPage'
import DashboardPage from './pages/DashboardPage'

// Components
import Header from './components/layout/Header'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header user={user} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/celebrity/:id" element={<CelebrityProfilePage />} />
            <Route path="/request/:celebrityId" element={<RequestVideoPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
}

export default App