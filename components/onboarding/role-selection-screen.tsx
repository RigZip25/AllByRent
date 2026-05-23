"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Package, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UserRole = "owner" | "renter";

interface RoleSelectionScreenProps {
  onRoleSelect: (role: UserRole) => void;
}

const roles = [
  {
    id: "owner" as UserRole,
    title: "I want to list",
    subtitle: "Share what you own",
    icon: Package,
    description: "Turn your idle stuff into income. List your tools, gear, equipment — anything your neighbors might need.",
    benefits: ["Earn while you sleep", "Auto-insurance included", "QR tracking on every item"],
    color: "from-primary/20 to-primary/5",
    borderColor: "border-primary/30",
  },
  {
    id: "renter" as UserRole,
    title: "I want to rent",
    subtitle: "Borrow from neighbors",
    icon: Search,
    description: "Why buy when you can borrow? Find cameras, tools, sports gear and more — right in your neighborhood.",
    benefits: ["Save money", "Try before you buy", "Everything insured"],
    color: "from-accent/20 to-accent/5",
    borderColor: "border-accent/30",
  },
];

export function RoleSelectionScreen({ onRoleSelect }: RoleSelectionScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Mr. Rentano */}
      <div className="pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-4"
        >
          <Image
            src="/mr-rentano.png"
            alt="Mr. Rentano"
            width={100}
            height={100}
            className="mx-auto"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Welcome to AllByRent
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-balance"
        >
          Your garage is the next economy
        </motion.p>
      </div>

      {/* Role Cards */}
      <div className="flex-1 px-4 pb-6 space-y-4">
        {roles.map((role, index) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.15 }}
              onClick={() => setSelectedRole(role.id)}
              className={`
                w-full p-5 rounded-2xl border-2 text-left transition-all duration-300
                bg-gradient-to-br ${role.color}
                ${isSelected 
                  ? "border-primary ring-2 ring-primary/20 scale-[1.02]" 
                  : role.borderColor + " hover:scale-[1.01]"
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center shrink-0
                  ${isSelected ? "bg-primary text-primary-foreground" : "bg-card"}
                  transition-colors duration-300
                `}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{role.title}</h3>
                      <p className="text-sm text-primary font-medium">{role.subtitle}</p>
                    </div>
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                      transition-all duration-300
                      ${isSelected 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground/30"
                      }
                    `}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2.5 h-2.5 bg-primary-foreground rounded-full"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {role.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.benefits.map((benefit) => (
                      <span
                        key={benefit}
                        className="text-xs bg-card/80 text-foreground px-2.5 py-1 rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground px-6 pb-4"
      >
        You can always do both — list and rent anytime
      </motion.p>

      {/* Continue Button */}
      <motion.div 
        className="px-4 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold gap-2"
          disabled={!selectedRole}
          onClick={() => selectedRole && onRoleSelect(selectedRole)}
        >
          {selectedRole ? (
            <>
              {selectedRole === "owner" ? "Start Listing" : "Start Browsing"}
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            "Choose to continue"
          )}
        </Button>
      </motion.div>
    </div>
  );
}
