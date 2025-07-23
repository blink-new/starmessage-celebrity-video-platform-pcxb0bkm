import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Star, Download, Share2, Play, Package } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { blink } from '../blink/client'

interface VideoRequest {
  id: string
  celebrityId: string
  celebrityName?: string
  celebrityImage?: string
  occasion: string
  recipientName: string
  customMessage: string
  pricePaid: number
  status: string
  videoUrl?: string
  createdAt: string
  completedAt?: string
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<VideoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const loadRequests = async (userId: string) => {
    try {
      setLoading(true)
      const videoRequests = await blink.db.videoRequests.list({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      // Get celebrity details for each request
      const requestsWithCelebrities = await Promise.all(
        videoRequests.map(async (request) => {
          try {
            const celebrities = await blink.db.celebrities.list({
              where: { id: request.celebrityId }
            })
            
            const celebrity = celebrities[0]
            return {
              id: request.id,
              celebrityId: request.celebrityId,
              celebrityName: celebrity?.name || 'Unknown Celebrity',
              celebrityImage: celebrity?.profileImageUrl,
              occasion: request.occasion,
              recipientName: request.recipientName,
              customMessage: request.customMessage,
              pricePaid: request.pricePaid,
              status: request.status,
              videoUrl: request.videoUrl,
              createdAt: request.createdAt,
              completedAt: request.completedAt
            }
          } catch (error) {
            console.error('Error loading celebrity for request:', error)
            return {
              id: request.id,
              celebrityId: request.celebrityId,
              celebrityName: 'Unknown Celebrity',
              celebrityImage: undefined,
              occasion: request.occasion,
              recipientName: request.recipientName,
              customMessage: request.customMessage,
              pricePaid: request.pricePaid,
              status: request.status,
              videoUrl: request.videoUrl,
              createdAt: request.createdAt,
              completedAt: request.completedAt
            }
          }
        })
      )

      setRequests(requestsWithCelebrities)
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadRequests(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Pending'
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in_progress')
  const completedRequests = requests.filter(r => r.status === 'completed')

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to view your orders.</p>
          <Button onClick={() => blink.auth.login()}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            My Orders
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your video requests and watch completed videos
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="h-6 bg-muted rounded w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't requested any video messages yet. Browse our celebrities to get started!
              </p>
              <Button asChild>
                <Link to="/browse">Browse Celebrities</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Orders ({requests.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Celebrity Image */}
                      <div className="flex-shrink-0">
                        {request.celebrityImage ? (
                          <img
                            src={request.celebrityImage}
                            alt={request.celebrityName}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Star className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Request Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {request.celebrityName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {request.occasion} for {request.recipientName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusText(request.status)}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                              {formatPrice(request.pricePaid)}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          "{request.customMessage}"
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            Ordered {formatDate(request.createdAt)}
                            {request.completedAt && (
                              <span className="ml-2">
                                • Completed {formatDate(request.completedAt)}
                              </span>
                            )}
                          </div>

                          {request.status === 'completed' && request.videoUrl ? (
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Play className="w-3 h-3 mr-1" />
                                Watch
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share2 className="w-3 h-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">
                              {request.status === 'pending' && 'Waiting for celebrity response'}
                              {request.status === 'in_progress' && 'Celebrity is creating your video'}
                              {request.status === 'cancelled' && 'Request was cancelled'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No pending orders</h3>
                    <p className="text-muted-foreground">All your orders have been completed!</p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {request.celebrityImage ? (
                            <img
                              src={request.celebrityImage}
                              alt={request.celebrityName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                              <Star className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                {request.celebrityName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {request.occasion} for {request.recipientName}
                              </p>
                            </div>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Ordered {formatDate(request.createdAt)}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {request.status === 'pending' && 'Your request has been sent to the celebrity'}
                            {request.status === 'in_progress' && 'The celebrity is working on your video'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No completed videos yet</h3>
                    <p className="text-muted-foreground">Your completed videos will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                completedRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {request.celebrityImage ? (
                            <img
                              src={request.celebrityImage}
                              alt={request.celebrityName}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                              <Star className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                {request.celebrityName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {request.occasion} for {request.recipientName}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm">
                                <Play className="w-3 h-3 mr-1" />
                                Watch Video
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Completed {request.completedAt ? formatDate(request.completedAt) : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}