"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  MessageSquarePlus, Share2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  FaWhatsapp, FaFacebook, FaInstagram, FaXTwitter 
} from "react-icons/fa6";

interface EmptyStateRequestBoardProps {
  location?: string;
  category?: string;
  onPostRequest: () => void;
  onShare: (platform: string) => void;
}

const shareMessage = "I'm looking for rentals in my area but nothing's listed yet. Anyone nearby have items to rent? Check out AllByRent - the neighbor-to-neighbor rental marketplace!";

const socialPlatforms = [
  { id: "whatsapp", icon: FaWhatsapp, label: "WhatsApp", color: "bg-[#25D366] hover:bg-[#20BD5A]" },
  { id: "facebook", icon: FaFacebook, label: "Facebook", color: "bg-[#1877F2] hover:bg-[#166FE5]" },
  { id: "instagram", icon: FaInstagram, label: "Instagram", color: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
  { id: "twitter", icon: FaXTwitter, label: "X", color: "bg-black hover:bg-gray-900" },
];

export function EmptyStateRequestBoard({ 
  location, 
  category,
  onPostRequest, 
  onShare 
}: EmptyStateRequestBoardProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Mr. Rentano */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
      >
        <Image
          src="/mr-rentano.png"
          alt="Mr. Rentano"
          width={100}
          height={100}
          className="mb-6"
        />
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-foreground mb-2">
          Nothing listed here yet
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xs">
          {location 
            ? `Be the first to request something in ${location}!`
            : category 
              ? `No ${category} listings yet — but you can change that.`
              : "Be the first request in this area. Someone nearby might have exactly what you need."
          }
        </p>
      </motion.div>

      {/* Post Request Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm mb-6"
      >
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold gap-2"
          onClick={onPostRequest}
        >
          <MessageSquarePlus className="w-5 h-5" />
          Post a Request
        </Button>
        <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4" />
          Neighbors get notified instantly
        </p>
      </motion.div>

      {/* Share Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            Share with your community
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-center gap-3">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => onShare(platform.id)}
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  text-white transition-transform hover:scale-110
                  ${platform.color}
                `}
                aria-label={`Share on ${platform.label}`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 px-4">
          &ldquo;{shareMessage.slice(0, 60)}...&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
