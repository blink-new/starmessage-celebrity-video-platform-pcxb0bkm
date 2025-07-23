import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Star, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { blink } from '@/blink/client'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  // Auth state management
  useState(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  })

  const handleLogin = () => {
    blink.auth.login()
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">StarMessage</span>
            <span className="text-xs text-slate-400 hidden sm:block">A Celebrity Video Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/browse"
              className={`text-sm font-medium transition-colors ${
                isActive('/browse')
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Browse Celebrities
            </Link>
            <Link
              to="/categories"
              className={`text-sm font-medium transition-colors ${
                isActive('/categories')
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/how-it-works"
              className={`text-sm font-medium transition-colors ${
                isActive('/how-it-works')
                  ? 'text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              How It Works
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                My Orders
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white">{user.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/browse"
                className="text-slate-300 hover:text-white text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Celebrities
              </Link>
              <Link
                to="/categories"
                className="text-slate-300 hover:text-white text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                to="/how-it-works"
                className="text-slate-300 hover:text-white text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
              
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-white">{user.email}</span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}