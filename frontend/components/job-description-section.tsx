"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Briefcase, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeResume } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { AnalysisResult } from "@/lib/api"

interface JobDescriptionSectionProps {
  sessionId: string
  onAnalysisComplete: (result: AnalysisResult) => void
}

export function JobDescriptionSection({ sessionId, onAnalysisComplete }: JobDescriptionSectionProps) {
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await analyzeResume(sessionId, jobDescription || undefined)
      
      toast({
        title: "Analysis complete",
        description: "Your resume has been analyzed successfully"
      })

      onAnalysisComplete(response.analysis)
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSkip = () => {
    handleAnalyze()
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Add Job Description</h2>
              <p className="text-muted-foreground">
                Optional but recommended for better matching analysis
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to get personalized matching analysis..."
                className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSkip}
                disabled={isAnalyzing}
                variant="outline"
                className="flex-1"
              >
                Skip & Analyze
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobDescription.trim()}
                variant="gradient"
                className="flex-1 gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze with JD
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Adding a job description improves match accuracy by up to 40%
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
