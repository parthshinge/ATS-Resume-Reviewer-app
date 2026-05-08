"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Wallet, Shield, Clock, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createPayment, verifyPayment } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface PaymentSectionProps {
  sessionId: string
  onPaymentComplete: () => void
}

interface PaymentData {
  paymentId: string
  checkoutUrl?: string
  amount: number
  status: string
}

export function PaymentSection({ sessionId, onPaymentComplete }: PaymentSectionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const { toast } = useToast()

  const handleCreatePayment = async () => {
    setIsCreating(true)
    try {
      const payment = await createPayment(sessionId)
      setPaymentData(payment)
      
      // Open payment in new window if checkout URL exists
      if (payment.checkoutUrl) {
        window.open(payment.checkoutUrl, '_blank')
      }

      toast({
        title: "Payment initiated",
        description: "Please complete the payment in the new window"
      })
    } catch (error) {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to create payment",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!paymentData?.paymentId) return

    setIsVerifying(true)
    try {
      const result = await verifyPayment(sessionId, paymentData.paymentId)
      
      if (result.verified) {
        toast({
          title: "Payment confirmed",
          description: "Your analysis is ready to begin!"
        })
        onPaymentComplete()
      } else {
        toast({
          title: "Payment pending",
          description: "Please complete the payment and try again",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
              <p className="text-muted-foreground">
                Pay once, analyze forever. No subscriptions.
              </p>
            </div>

            <div className="bg-muted rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Resume Analysis</span>
                <span className="text-2xl font-bold">$2.00</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>ATS Score & Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Job Match Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Bullet Point Rewrites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Skills Gap Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Downloadable PDF Report</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-6">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-800 dark:text-green-200">
                Secure payment via Base blockchain. No payment data stored on our servers.
              </p>
            </div>

            {!paymentData ? (
              <Button
                onClick={handleCreatePayment}
                disabled={isCreating}
                variant="gradient"
                size="lg"
                className="w-full gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Payment...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Pay with Crypto
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {paymentData.checkoutUrl && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => window.open(paymentData.checkoutUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Payment Page
                  </Button>
                )}
                
                <Button
                  onClick={handleVerifyPayment}
                  disabled={isVerifying}
                  variant="gradient"
                  size="lg"
                  className="w-full gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      I've Completed Payment
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Payment expires in 30 minutes</span>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Supported: ETH, USDC, USDT on Base</p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
