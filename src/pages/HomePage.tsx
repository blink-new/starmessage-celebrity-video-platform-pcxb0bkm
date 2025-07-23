import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Star, Clock, Users, TrendingUp, Filter, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { blink } from '@/blink/client'

interface Celebrity {
  id: string
  name: string
  category: string
  price: number
  rating: number
  response_time: string
  image_url: string
  is_featured: boolean
  total_reviews: number
}

const categories = [
  'All', 'Sports', 'Entertainment', 'Music', 'Comedy', 'Reality TV', 'Influencer', 'Business'
]

const trendingSearches = [
  'Birthday wishes', 'Congratulations', 'Motivational', 'Anniversary', 'Get well soon', 'Roast'
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [featuredCelebrities, setFeaturedCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  const loadCelebrities = async () => {
    try {
      const allCelebrities = await blink.db.celebrities.list({
        orderBy: { rating: 'desc' },
        limit: 50
      })
      
      setCelebrities(allCelebrities)
      setFeaturedCelebrities(allCelebrities.filter(c => Number(c.is_featured) > 0).slice(0, 6))
    } catch (error) {
      console.error('Error loading celebrities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCelebrities()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`)
    } else {
      navigate(`/browse?category=${selectedCategory}`)
    }
  }

  const handleTrendingSearch = (term: string) => {
    setSearchQuery(term)
    navigate(`/browse?search=${encodeURIComponent(term)}`)
  }

  const filteredCelebrities = celebrities.filter(celebrity => {
    const matchesSearch = celebrity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         celebrity.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || celebrity.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading celebrities...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-60 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-1500"></div>
        
        {/* Larger stars */}
        <div className="absolute top-32 right-1/4 text-white text-2xl animate-pulse">✦</div>
        <div className="absolute bottom-32 left-1/3 text-white text-xl animate-pulse delay-1000">✦</div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-8 h-8 bg-indigo-500/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-16 w-6 h-6 bg-amber-500/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-10 h-10 bg-purple-500/20 rounded-full animate-bounce delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Get personalized videos from your
            <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              favorite celebrities
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Browse thousands of celebrities and request custom video messages for birthdays, 
            congratulations, or any special occasion.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for celebrities, categories, or occasions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full h-16 pl-6 pr-20 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 rounded-2xl focus:bg-white/20 focus:border-indigo-400 transition-all"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-2 h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-xl"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2 transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Trending Searches */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300 font-medium">Trending searches:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleTrendingSearch(term)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full text-sm transition-all border border-white/10 hover:border-white/20"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-slate-400">Active Celebrities</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">1M+</div>
              <div className="text-slate-400">Videos Created</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">24hrs</div>
              <div className="text-slate-400">Average Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Celebrities Section */}
      <div className="relative z-10 py-16 bg-gradient-to-b from-transparent to-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Celebrities</h2>
            <p className="text-xl text-slate-300">Popular personalities ready to create your video</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredCelebrities.map((celebrity) => (
              <Card key={celebrity.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all group cursor-pointer">
                <CardContent className="p-6">
                  <Link to={`/celebrity/${celebrity.id}`} className="block">
                    <div className="relative mb-4">
                      <img
                        src={celebrity.image_url}
                        alt={celebrity.name}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <Badge className="absolute top-3 left-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                        {celebrity.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                      {celebrity.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-white font-medium">{celebrity.rating}</span>
                        <span className="text-slate-400">({celebrity.total_reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{celebrity.response_time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">
                        ${celebrity.price}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => navigate('/browse')}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg"
            >
              Browse All Celebrities
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results Preview (when searching) */}
      {searchQuery && (
        <div className="relative z-10 py-16 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">
                Search Results for "{searchQuery}"
              </h2>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {filteredCelebrities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCelebrities.slice(0, 8).map((celebrity) => (
                  <Card key={celebrity.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all group cursor-pointer">
                    <CardContent className="p-4">
                      <Link to={`/celebrity/${celebrity.id}`} className="block">
                        <div className="relative mb-3">
                          <img
                            src={celebrity.image_url}
                            alt={celebrity.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-xs">
                            {celebrity.category}
                          </Badge>
                        </div>
                        
                        <h3 className="font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                          {celebrity.name}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-white">{celebrity.rating}</span>
                          </div>
                          <div className="text-white font-bold">
                            ${celebrity.price}
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-4">No celebrities found matching your search</div>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                  }}
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Clear Search
                </Button>
              </div>
            )}

            {filteredCelebrities.length > 8 && (
              <div className="text-center mt-8">
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl"
                >
                  View All {filteredCelebrities.length} Results
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How It Works Section */}
      <div className="relative z-10 py-16 bg-gradient-to-b from-slate-800/50 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-300">Get your personalized video in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">1. Find Your Celebrity</h3>
              <p className="text-slate-300">Browse our directory of thousands of celebrities across all categories and find the perfect match.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">2. Make Your Request</h3>
              <p className="text-slate-300">Tell us about the occasion and what you'd like them to say. Add personal details to make it special.</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">3. Receive Your Video</h3>
              <p className="text-slate-300">Get your personalized video within 7 days. Download, share, and treasure it forever.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}