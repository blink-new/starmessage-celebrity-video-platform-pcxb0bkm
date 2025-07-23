import { Star } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center animate-pulse">
            <Star className="w-8 h-8 text-primary-foreground fill-current" />
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-primary/20 rounded-full animate-spin border-t-primary"></div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">StarMessage</h1>
        <p className="text-muted-foreground">Loading your celebrity experience...</p>
      </div>
    </div>
  )
}