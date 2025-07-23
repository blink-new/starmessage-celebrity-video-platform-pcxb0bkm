import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Clock, Users, Play, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { blink } from '../blink/client'

interface Celebrity {
  id: string
  name: string
  category: string
  bio: string
  pricePerVideo: number
  profileImageUrl: string
  rating: number
  totalReviews: number
  responseTimeHours: number
}

export default function CelebrityProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCelebrity = async () => {
      if (!id) return
      
      try {
        const celebrities = await blink.db.celebrities.list({
          where: { id }
        })
        
        if (celebrities.length > 0) {
          const celeb = celebrities[0]
          setCelebrity({
            id: celeb.id,
            name: celeb.name,
            category: celeb.category,
            bio: celeb.bio,
            pricePerVideo: celeb.pricePerVideo,
            profileImageUrl: celeb.profileImageUrl,
            rating: celeb.rating,
            totalReviews: celeb.totalReviews,
            responseTimeHours: celeb.responseTimeHours
          })
        }
      } catch (error) {
        console.error('Error loading celebrity:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCelebrity()
  }, [id])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const formatResponseTime = (hours: number) => {
    if (hours < 24) return `${hours} hours`
    const days = Math.round(hours / 24)
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Celebrity Not Found</h1>
          <p className="text-muted-foreground mb-6">The celebrity you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/browse">Browse Celebrities</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/browse">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Celebrity Image */}
          <div className="relative">
            <img
              src={celebrity.profileImageUrl}
              alt={celebrity.name}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-background/90 text-foreground">
                {celebrity.category}
              </Badge>
            </div>
          </div>

          {/* Celebrity Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {celebrity.name}
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-accent fill-current mr-1" />
                  <span className="font-medium">{celebrity.rating}</span>
                  <span className="ml-1">({celebrity.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Usually responds in {formatResponseTime(celebrity.responseTimeHours)}</span>
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {celebrity.bio}
            </p>

            {/* Pricing Card */}
            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {formatPrice(celebrity.pricePerVideo)}
                    </div>
                    <div className="text-sm text-muted-foreground">per video message</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      {celebrity.totalReviews} happy customers
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatResponseTime(celebrity.responseTimeHours)} response time
                    </div>
                  </div>
                </div>
                
                <Button asChild size="lg" className="w-full">
                  <Link to={`/request/${celebrity.id}`}>
                    Request Video Message
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Sample Video */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Sample Video</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Sample video coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What You Get Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">What You'll Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Personalized Video</h3>
                <p className="text-sm text-muted-foreground">
                  A custom video message created just for you or your loved one
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Quick Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Delivered within {formatResponseTime(celebrity.responseTimeHours)}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Share & Keep</h3>
                <p className="text-sm text-muted-foreground">
                  Download, share, and keep your video message forever
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}