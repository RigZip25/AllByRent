'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Camera, 
  Calendar,
  MapPin,
  Sparkles,
  Eye,
  Share2,
  Check,
  Users,
  MessageCircle,
  Copy,
  ChevronRight,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocale } from '@/lib/locale-context'

interface RentalRequestScreenProps {
  onBack: () => void
  onPost: () => void
}

const categories = [
  { id: 'electronics', icon: '📱', label: 'Electronics' },
  { id: 'tools', icon: '🔧', label: 'Tools' },
  { id: 'sports', icon: '⚽', label: 'Sports' },
  { id: 'outdoor', icon: '🏕️', label: 'Outdoor' },
  { id: 'music', icon: '🎸', label: 'Music' },
  { id: 'party', icon: '🎉', label: 'Party' },
  { id: 'baby', icon: '👶', label: 'Baby & Kids' },
  { id: 'photo', icon: '📷', label: 'Photo & Video' },
  { id: 'gaming', icon: '🎮', label: 'Gaming' },
  { id: 'travel', icon: '✈️', label: 'Travel' },
  { id: 'fashion', icon: '👗', label: 'Fashion' },
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'vehicles', icon: '🚗', label: 'Vehicles' },
  { id: 'books', icon: '📚', label: 'Books' },
  { id: 'medical', icon: '🏥', label: 'Medical' },
  { id: 'garden', icon: '🌱', label: 'Garden' },
  { id: 'office', icon: '💼', label: 'Office' },
  { id: 'art', icon: '🎨', label: 'Art & Craft' },
  { id: 'pets', icon: '🐕', label: 'Pets' },
  { id: 'fitness', icon: '💪', label: 'Fitness' },
]

const radiusOptions = [
  { value: 5, label: '5 mi' },
  { value: 10, label: '10 mi' },
  { value: 25, label: '25 mi' },
  { value: 50, label: '50 mi' },
]

const socialPlatforms = [
  { id: 'whatsapp', name: 'WhatsApp', color: 'bg-[#25D366]', icon: '💬' },
  { id: 'facebook', name: 'Facebook Groups', color: 'bg-[#1877F2]', icon: '👥' },
  { id: 'instagram', name: 'Instagram Stories', color: 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]', icon: '📸' },
  { id: 'nextdoor', name: 'Nextdoor', color: 'bg-[#8ED500]', icon: '🏘️' },
  { id: 'twitter', name: 'X / Twitter', color: 'bg-black', icon: '𝕏' },
  { id: 'copy', name: 'Copy Link', color: 'bg-muted', icon: '🔗' },
]

export function RentalRequestScreen({ onBack, onPost }: RentalRequestScreenProps) {
  const { t } = useLocale()
  const [step, setStep] = useState(1)
  
  // Step 1 state
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [radius, setRadius] = useState(25)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [budget, setBudget] = useState(50)
  const [hasPhoto, setHasPhoto] = useState(false)
  
  // Step 2 state
  const [showOnFeed, setShowOnFeed] = useState(true)
  const [allowAiMatch, setAllowAiMatch] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleShare = async (platform: string) => {
    const shareText = `Hey neighbors! Looking to rent a ${description || 'item'} for ${dateFrom || 'upcoming dates'}${dateTo ? ` - ${dateTo}` : ''}. Budget $${budget}/day. Anyone have one? allbyrent.app/request/abc123`
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(`${shareText}`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
      return
    }
    
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`,
      instagram: `https://instagram.com`, // Instagram doesn't support direct share URLs
      nextdoor: `https://nextdoor.com`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    }
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank')
    }
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else onBack()
  }

  const handlePostRequest = () => {
    setStep(3)
  }

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all duration-300 ${
            s === step ? 'w-8 bg-primary' : s < step ? 'w-2 bg-primary' : 'w-2 bg-muted'
          }`}
        />
      ))}
    </div>
  )

  // STEP 1: What do you need?
  const Step1 = () => (
    <div className="px-4 py-6 space-y-6 pb-32">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Can&apos;t find it? Ask your neighbors.
        </h1>
        <p className="text-muted-foreground">
          Post a request — someone nearby might have exactly what you need.
        </p>
      </div>

      {/* Category Grid */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          What category?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {categories.slice(0, 20).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                category === cat.id
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[10px] font-medium truncate w-full text-center">
                {t(`cat.${cat.id}`) || cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Describe what you need
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., A drone with 4K camera for filming a wedding this weekend..."
          rows={4}
          className="w-full px-4 py-3 bg-muted border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base"
        />
      </div>

      {/* Photo (optional) */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Reference photo (optional)
        </label>
        <button 
          onClick={() => setHasPhoto(!hasPhoto)}
          className={`w-full h-24 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 transition-colors ${
            hasPhoto 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Camera className={`w-6 h-6 ${hasPhoto ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-sm ${hasPhoto ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            {hasPhoto ? 'Photo added' : 'Tap to add a photo'}
          </span>
        </button>
      </div>

      {/* Location Radius */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Search radius
        </label>
        <div className="flex gap-2">
          {radiusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRadius(opt.value)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                radius === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          When do you need it?
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-12 pl-10 bg-muted border-0"
              placeholder="From"
            />
          </div>
          <div className="flex-1 relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-12 pl-10 bg-muted border-0"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Budget Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            I&apos;d pay up to
          </label>
          <span className="text-lg font-bold text-primary">${budget}/day</span>
        </div>
        <input
          type="range"
          min="5"
          max="500"
          step="5"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$5</span>
          <span>$500</span>
        </div>
      </div>
    </div>
  )

  // STEP 2: Make it visible
  const Step2 = () => (
    <div className="px-4 py-6 space-y-6 pb-32">
      {/* Preview Card */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Preview of your request
        </label>
        <div className="bg-muted rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">
                {categories.find(c => c.id === category)?.icon || '📦'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground line-clamp-2">
                {description || 'Your item description'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Within {radius} mi</span>
                <span>•</span>
                <span>Up to ${budget}/day</span>
              </div>
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4" />
              <span>{dateFrom || 'Start'} — {dateTo || 'End'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <button
          onClick={() => setShowOnFeed(!showOnFeed)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
            showOnFeed 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-muted'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            showOnFeed ? 'bg-primary/20' : 'bg-background'
          }`}>
            <Eye className={`w-6 h-6 ${showOnFeed ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">Show on AllByRent feed</p>
            <p className="text-sm text-muted-foreground">Visible to neighbors in your area</p>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            showOnFeed ? 'border-primary bg-primary' : 'border-muted-foreground'
          }`}>
            {showOnFeed && <Check className="w-4 h-4 text-primary-foreground" />}
          </div>
        </button>

        <button
          onClick={() => setAllowAiMatch(!allowAiMatch)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
            allowAiMatch 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-muted'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            allowAiMatch ? 'bg-primary/20' : 'bg-background'
          }`}>
            <Sparkles className={`w-6 h-6 ${allowAiMatch ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">Let Mr. Rentano match me</p>
            <p className="text-sm text-muted-foreground">AI will notify owners with matching items</p>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            allowAiMatch ? 'border-primary bg-primary' : 'border-muted-foreground'
          }`}>
            {allowAiMatch && <Check className="w-4 h-4 text-primary-foreground" />}
          </div>
        </button>
      </div>

      {/* Share Section */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Share with your community
          </h2>
          <p className="text-sm text-muted-foreground">
            The more people see it, the faster you find it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {socialPlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleShare(platform.id)}
              className={`${platform.color} text-white rounded-xl p-4 flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span className="font-medium text-sm text-left flex-1">
                {platform.id === 'copy' && copiedLink ? 'Copied!' : platform.name}
              </span>
              {platform.id !== 'copy' && (
                <ChevronRight className="w-4 h-4 opacity-60" />
              )}
              {platform.id === 'copy' && copiedLink && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground px-4">
          Pre-written message: &ldquo;Hey neighbors! Looking to rent a {description || '[item]'} for {dateFrom || '[dates]'}. Budget ${budget}/day. Anyone have one?&rdquo;
        </p>
      </div>
    </div>
  )

  // STEP 3: Success
  const Step3 = () => (
    <div className="px-4 py-8 space-y-8 text-center pb-32">
      {/* Mr. Rentano */}
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
        <Image
          src="/mr-rentano.png"
          alt="Mr. Rentano"
          fill
          className="object-cover rounded-full border-4 border-background shadow-xl"
        />
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-background">
          <Check className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-foreground">
          Request posted!
        </h1>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Your request is live! We&apos;ll notify you the moment someone nearby responds.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-muted rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <span className="text-2xl font-bold text-foreground">2,847</span>
          <span className="text-muted-foreground">people within {radius} mi can see this</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Owners with similar items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-xs text-muted-foreground">Already notified</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">Live</p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
        </div>
      </div>

      {/* Notification Preview */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-left text-foreground">
          <span className="font-medium">Mr. Rentano</span> is searching for matches and will message you when owners respond.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full h-12"
          onClick={() => handleShare('copy')}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Again
        </Button>
        
        <Button 
          className="w-full h-14 text-base font-semibold"
          onClick={onPost}
        >
          Browse What&apos;s Available Now
        </Button>
        
        <button 
          onClick={() => {
            setStep(1)
            setDescription('')
            setCategory('')
            setBudget(50)
            setDateFrom('')
            setDateTo('')
          }}
          className="text-sm text-primary font-medium hover:underline"
        >
          Post Another Request
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button 
            onClick={handleBack} 
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">
              {step === 1 && 'What do you need?'}
              {step === 2 && 'Make it visible'}
              {step === 3 && 'Request Posted'}
            </h1>
          </div>
          {step < 3 && (
            <span className="text-sm text-muted-foreground">
              Step {step}/2
            </span>
          )}
        </div>
        {step < 3 && <StepIndicator />}
      </header>

      {/* Content */}
      <div className="overflow-y-auto">
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
      </div>

      {/* Bottom Actions (Step 1 & 2 only) */}
      {step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
          <Button 
            className="w-full h-14 text-base font-semibold"
            onClick={step === 2 ? handlePostRequest : handleNext}
            disabled={step === 1 && (!description || !category)}
          >
            {step === 1 ? 'Next' : 'Post Request'}
          </Button>
        </div>
      )}
    </div>
  )
}
