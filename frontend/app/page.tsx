"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { UploadSection } from "@/components/upload-section"
import { PaymentSection } from "@/components/payment-section"
import { JobDescriptionSection } from "@/components/job-description-section"
import { AnalysisResults } from "@/components/analysis-results"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"
import type { AnalysisResult } from "@/lib/api"

type Step = 'hero' | 'upload' | 'payment' | 'job-description' | 'results'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('hero')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const uploadRef = useRef<HTMLDivElement>(null)

  const scrollToUpload = () => {
    setCurrentStep('upload')
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleUploadComplete = (sid: string, fname: string) => {
    setSessionId(sid)
    setFileName(fname)
    setCurrentStep('payment')
  }

  const handlePaymentComplete = () => {
    setCurrentStep('job-description')
  }

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result)
    setCurrentStep('results')
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {currentStep === 'hero' && (
        <>
          <Hero onGetStarted={scrollToUpload} />
          <div ref={uploadRef}>
            <UploadSection onUploadComplete={handleUploadComplete} />
          </div>
          <Features />
        </>
      )}

      {currentStep === 'upload' && (
        <div className="pt-24">
          <UploadSection onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {currentStep === 'payment' && sessionId && (
        <div className="pt-24">
          <PaymentSection 
            sessionId={sessionId} 
            onPaymentComplete={handlePaymentComplete} 
          />
        </div>
      )}

      {currentStep === 'job-description' && sessionId && (
        <div className="pt-24">
          <JobDescriptionSection 
            sessionId={sessionId}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      )}

      {currentStep === 'results' && analysisResult && sessionId && (
        <div className="pt-24">
          <AnalysisResults 
            analysis={analysisResult}
            sessionId={sessionId}
          />
        </div>
      )}

      <Footer />
    </main>
  )
}
