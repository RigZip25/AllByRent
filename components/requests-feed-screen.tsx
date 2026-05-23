'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  ArrowLeft, 
  MapPin,
  Clock,
  MessageCircle,
  Share2,
  Filter,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/locale-context'

interface RequestsFeedScreenProps {
  onBack: () => void
  onCreateRequest: () => void
}

const mockRequests = [
  {
    id: '1',
    title: 'DJI Mavic 3 or similar drone',
    category: 'electronics',
    budget: 75,
    when: 'This Saturday',
    user: {
      name: 'Alex M.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      verified: true,
    },
    location: '0.8 km',
    postedAt: '2 hours ago',
    description: 'Need for real estate photography. 4K camera required.',
    responses: 3,
  },
  {
    id: '2',
    title: 'Camping tent for 4 people',
    category: 'outdoor',
    budget: 40,
    when: 'June 15-18',
    user: {
      name: 'Maria S.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      verified: true,
    },
    location: '1.2 km',
    postedAt: '5 hours ago',
    description: 'Family camping trip. Waterproof preferred.',
    responses: 1,
  },
  {
    id: '3',
    title: 'Electric guitar + amp',
    category: 'music',
    budget: 50,
    when: 'ASAP',
    user: {
      name: 'James K.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      verified: false,
    },
    location: '2.1 km',
    postedAt: '1 day ago',
    description: 'For a jam session this weekend. Any brand works.',
    responses: 0,
  },
  {
    id: '4',
    title: 'Baby stroller',
    category: 'baby',
    budget: 25,
    when: 'Next week',
    user: {
      name: 'Emma L.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      verified: true,
    },
    location: '0.5 km',
    postedAt: '3 hours ago',
    description: 'Visiting family. Need a lightweight stroller for the trip.',
    responses: 5,
  },
  {
    id: '5',
    title: 'Pressure washer',
    category: 'tools',
    budget: 35,
    when: 'This Sunday',
    user: {
      name: 'Robert C.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      verified: true,
    },
    location: '1.8 km',
    postedAt: '6 hours ago',
    description: 'Spring cleaning the deck and driveway.',
    responses: 2,
  },
]

const categoryEmojis: Record<string, string> = {
  electronics: '📱',
  tools: '🔧',
  sports: '⚽',
  outdoor: '🏕️',
  music: '🎸',
  party: '🎉',
  baby: '👶',
  photo: '📷',
  gaming: '🎮',
  travel: '✈️',
}

export function RequestsFeedScreen({ onBack, onCreateRequest }: RequestsFeedScreenProps) {
  const { t, formatCurrency } = useLocale()
  const [filter, setFilter] = useState<string>('all')

  const handleOffer = (requestId: string) => {
    // In real app, would open offer modal
    console.log('Making offer for request:', requestId)
  }

  const handleShare = async (request: typeof mockRequests[0]) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Looking for: ${request.title}`,
          text: `Someone near you needs: ${request.title}. Budget: $${request.budget}/day. Can you help?`,
          url: `https://allbyrent.com/requests/${request.id}`,
        })
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">{t('requests.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('requests.subtitle')}</p>
          </div>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Filter className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Category filters */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {t('cat.all')}
            </button>
            {Object.entries(categoryEmojis).slice(0, 6).map(([cat, emoji]) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filter === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {emoji} {t(`cat.${cat}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Requests list */}
      <div className="px-4 py-4 space-y-4">
        {mockRequests
          .filter(r => filter === 'all' || r.category === filter)
          .map((request) => (
          <div 
            key={request.id} 
            className="bg-card border border-border rounded-2xl p-4 space-y-4"
          >
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={request.user.avatar}
                  alt={request.user.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
                {request.user.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{request.user.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{request.location}</span>
                  <span>•</span>
                  <span>{request.postedAt}</span>
                </div>
              </div>
              <button 
                onClick={() => handleShare(request)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Request content */}
            <div>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl">{categoryEmojis[request.category]}</span>
                <h3 className="font-semibold text-foreground text-lg leading-tight">
                  {request.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">{request.description}</p>
            </div>

            {/* Details row */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-accent-foreground">$</span>
                </div>
                <span className="font-medium text-foreground">{formatCurrency(request.budget)}</span>
                <span className="text-muted-foreground">{t('item.per_day')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{request.when}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button 
                className="flex-1 h-11"
                onClick={() => handleOffer(request.id)}
              >
                {t('requests.i_have_this')}
              </Button>
              <Button 
                variant="outline" 
                className="h-11"
                onClick={() => handleOffer(request.id)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {request.responses > 0 && (
                  <span className="mr-1">{request.responses}</span>
                )}
                Chat
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating action button */}
      <button
        onClick={onCreateRequest}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-6 h-6 text-primary-foreground" />
      </button>
    </div>
  )
}
