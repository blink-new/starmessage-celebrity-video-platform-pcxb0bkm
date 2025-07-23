import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Star, Clock, Filter, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Slider } from '../components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { blink } from '../blink/client'

interface Celebrity {
  id: string
  name: string
  category: string
  bio: string
  price: number
  image_url: string
  rating: number
  total_reviews: number
  response_time: string
}

const categories = ['All', 'Sports', 'Entertainment', 'Music', 'Comedy', 'Reality TV', 'Influencer', 'Business']
const sortOptions = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'response_time', label: 'Fastest Response' }
]

const trendingSearches = [
  'Birthday wishes', 'Congratulations', 'Motivational', 'Anniversary', 'Get well soon', 'Roast'
]

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [sortBy, setSortBy] = useState('rating')
  const [priceRange, setPriceRange] = useState([0, 500])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const getSortOrder = () => {
      switch (sortBy) {
        case 'price_asc':
          return { price: 'asc' as const }
        case 'price_desc':
          return { price: 'desc' as const }
        case 'response_time':
          return { response_time: 'asc' as const }
        default:
          return { rating: 'desc' as const }
      }
    }

    const loadCelebrities = async () => {
      try {
        setLoading(true)
        let celebrities = await blink.db.celebrities.list({
          orderBy: getSortOrder(),
          limit: 50
        })

        // Apply filters
        if (selectedCategory !== 'All') {
          celebrities = celebrities.filter(celeb => celeb.category === selectedCategory)
        }

        if (searchQuery) {
          celebrities = celebrities.filter(celeb => 
            celeb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            celeb.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
            celeb.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        // Apply price filter
        celebrities = celebrities.filter(celeb => {
          const price = celeb.price
          return price >= priceRange[0] && price <= priceRange[1]
        })

        setCelebrities(celebrities)
      } catch (error) {
        console.error('Error loading celebrities:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCelebrities()
  }, [selectedCategory, sortBy, searchQuery, priceRange])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory !== 'All') params.set('category', selectedCategory)
    setSearchParams(params)
  }

  const handleTrendingSearch = (term: string) => {
    setSearchQuery(term)
    const params = new URLSearchParams()
    params.set('search', term)
    if (selectedCategory !== 'All') params.set('category', selectedCategory)
    setSearchParams(params)
  }

  const formatResponseTime = (timeStr: string) => {
    return timeStr
  }

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Category</h3>
        <div className="grid grid-cols-1 gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`justify-start ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          min={0}
          step={25}
          className="w-full"
        />
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-white/10 text-white border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-white/20">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Browse Celebrities
          </h1>
          <p className="text-xl text-slate-300">
            Discover amazing celebrities ready to create personalized videos for you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search celebrities, categories, or occasions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:bg-white/20 focus:border-indigo-400"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-2 h-8 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Mobile Filter Button */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-slate-800 border-white/20">
                <SheetHeader>
                  <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Trending Searches */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 text-sm font-medium">Trending searches:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleTrendingSearch(term)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full text-sm transition-all border border-white/10 hover:border-white/20"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-6 sticky top-24 bg-white/10 backdrop-blur-sm border-white/20">
              <div className="flex items-center mb-4">
                <Filter className="w-4 h-4 mr-2 text-white" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>
              <FilterContent />
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-slate-300">
                {loading ? 'Loading...' : `${celebrities.length} celebrities found`}
              </p>
            </div>

            {/* Celebrity Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-white/5 animate-pulse" />
                      <div className="p-6">
                        <div className="h-4 bg-white/10 rounded animate-pulse mb-2" />
                        <div className="h-3 bg-white/10 rounded animate-pulse w-2/3 mb-4" />
                        <div className="h-3 bg-white/10 rounded animate-pulse mb-4" />
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-white/10 rounded animate-pulse w-16" />
                          <div className="h-4 bg-white/10 rounded animate-pulse w-12" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : celebrities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No celebrities found</h3>
                <p className="text-slate-300 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setPriceRange([0, 500])
                    setSearchParams({})
                  }}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {celebrities.map((celebrity) => (
                  <Card key={celebrity.id} className="overflow-hidden hover:shadow-xl transition-all group bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={celebrity.image_url}
                          alt={celebrity.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                            {celebrity.category}
                          </Badge>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs font-medium text-white">{celebrity.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {celebrity.name}
                        </h3>
                        <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                          {celebrity.bio}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-2xl font-bold text-white">
                            ${celebrity.price}
                          </div>
                          <div className="flex items-center text-sm text-slate-300">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatResponseTime(celebrity.response_time)}
                          </div>
                        </div>
                        <Button asChild className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0">
                          <Link to={`/celebrity/${celebrity.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}