"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Lock, FileText, Wallet, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "ATS Optimization",
    description: "Get your resume scored against major ATS systems. Know exactly how to improve your chances of getting past the bots."
  },
  {
    icon: Zap,
    title: "AI-Powered Analysis",
    description: "GPT-4 analyzes your resume for impact, clarity, and keyword optimization. Get professional-grade feedback instantly."
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "No account required. Your resume is never stored in our database. Auto-deleted after 30 minutes of processing."
  },
  {
    icon: FileText,
    title: "Job Match Scoring",
    description: "Paste a job description and see how well you match. Get personalized keyword suggestions to improve alignment."
  },
  {
    icon: Wallet,
    title: "Pay Per Use",
    description: "No subscriptions. Just $2 per analysis. Pay securely with crypto on Base blockchain. Transparent and fair pricing."
  },
  {
    icon: Clock,
    title: "Instant Results",
    description: "Get comprehensive analysis in under 60 seconds. Download a detailed PDF report to share or review later."
  }
]

export function Features() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Why Choose ResumeX?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Professional resume analysis without the hassle. Privacy-focused, instant, and powered by cutting-edge AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
