import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Clock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface Celebrity {
  id: string
  name: string
  category: string
  pricePerVideo: number
  profileImageUrl: string
  rating: number
  responseTimeHours: number
}

const occasions = [
  'Birthday',
  'Anniversary',
  'Graduation',
  'Wedding',
  'Get Well Soon',
  'Congratulations',
  'Holiday Greeting',
  'Just Because',
  'Other'
]

export default function RequestVideoPage() {
  const { celebrityId } = useParams<{ celebrityId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    occasion: '',
    recipientName: '',
    customMessage: '',
    specialInstructions: ''
  })

  useEffect(() => {
    const loadCelebrity = async () => {
      if (!celebrityId) return
      
      try {
        const celebrities = await blink.db.celebrities.list({
          where: { id: celebrityId }
        })
        
        if (celebrities.length > 0) {
          const celeb = celebrities[0]
          setCelebrity({
            id: celeb.id,
            name: celeb.name,
            category: celeb.category,
            pricePerVideo: celeb.pricePerVideo,
            profileImageUrl: celeb.profileImageUrl,
            rating: celeb.rating,
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
  }, [celebrityId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!celebrity || !formData.occasion || !formData.recipientName || !formData.customMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      
      // Get current user
      const user = await blink.auth.me()
      
      // Create video request
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.videoRequests.create({
        id: requestId,
        userId: user.id,
        celebrityId: celebrity.id,
        occasion: formData.occasion,
        recipientName: formData.recipientName,
        customMessage: formData.customMessage,
        specialInstructions: formData.specialInstructions,
        pricePaid: celebrity.pricePerVideo,
        status: 'pending',
        createdAt: new Date().toISOString()
      })

      toast({
        title: "Request Submitted!",
        description: `Your video request has been sent to ${celebrity.name}. You'll be notified when it's ready.`
      })

      // Redirect to dashboard
      navigate('/dashboard')
      
    } catch (error) {
      console.error('Error submitting request:', error)
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

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
          <div className="animate-pulse max-w-2xl mx-auto">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="h-64 bg-muted rounded mb-8" />
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
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
          <p className="text-muted-foreground mb-6">The celebrity you're trying to request from doesn't exist.</p>
          <Button onClick={() => navigate('/browse')}>
            Browse Celebrities
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-2xl mx-auto">
          {/* Celebrity Summary */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={celebrity.profileImageUrl}
                  alt={celebrity.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">{celebrity.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-accent fill-current mr-1" />
                      <span>{celebrity.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatResponseTime(celebrity.responseTimeHours)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(celebrity.pricePerVideo)}
                  </div>
                  <div className="text-xs text-muted-foreground">per video</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request Your Video Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Occasion */}
                <div className="space-y-2">
                  <Label htmlFor="occasion">What's the occasion? *</Label>
                  <Select value={formData.occasion} onValueChange={(value) => handleInputChange('occasion', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      {occasions.map((occasion) => (
                        <SelectItem key={occasion} value={occasion}>
                          {occasion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Recipient Name */}
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Who is this video for? *</Label>
                  <Input
                    id="recipientName"
                    placeholder="e.g., Sarah, Mom, the Johnson family"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  />
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <Label htmlFor="customMessage">What would you like them to say? *</Label>
                  <Textarea
                    id="customMessage"
                    placeholder="Tell us what you'd like the celebrity to mention in your video. Be specific about names, details, and the message you want to convey."
                    value={formData.customMessage}
                    onChange={(e) => handleInputChange('customMessage', e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific! Include names, relationships, and any special details you want mentioned.
                  </p>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special instructions (optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="Any special requests, props, or specific things you'd like them to do or say?"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Order Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Video message from {celebrity.name}</span>
                    <span className="font-semibold">{formatPrice(celebrity.pricePerVideo)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Expected delivery: within {formatResponseTime(celebrity.responseTimeHours)}
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : `Pay ${formatPrice(celebrity.pricePerVideo)} & Request Video`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this request, you agree to our terms of service. 
                  Payment will be processed securely.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}