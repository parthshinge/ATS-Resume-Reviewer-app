"use client"

import { motion } from "framer-motion"
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Target,
  Zap,
  FileText,
  ArrowRight,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { downloadReport } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import type { AnalysisResult } from "@/lib/api"

interface AnalysisResultsProps {
  analysis: AnalysisResult
  sessionId: string
}

export function AnalysisResults({ analysis, sessionId }: AnalysisResultsProps) {
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      const blob = await downloadReport(sessionId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resumex-analysis-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Report downloaded",
        description: "Your analysis report has been downloaded"
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the report",
        variant: "destructive"
      })
    }
  }

  const getVerdictIcon = () => {
    switch (analysis.verdict) {
      case 'strong':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'moderate':
        return <AlertCircle className="w-6 h-6 text-amber-500" />
      case 'weak':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <AlertCircle className="w-6 h-6 text-amber-500" />
    }
  }

  const getVerdictColor = () => {
    switch (analysis.verdict) {
      case 'strong':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      case 'moderate':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
      case 'weak':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      default:
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
    }
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Analysis Results</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {analysis.summary}
            </p>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  ATS Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">
                  {analysis.ats_score?.overall || 0}%
                </div>
                <Progress value={analysis.ats_score?.overall || 0} className="h-2" />
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formatting</span>
                    <span>{analysis.ats_score?.formatting || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Keywords</span>
                    <span>{analysis.ats_score?.keywords || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Readability</span>
                    <span>{analysis.ats_score?.readability || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Job Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">
                  {analysis.jd_match?.percentage || 0}%
                </div>
                <Progress value={analysis.jd_match?.percentage || 0} className="h-2" />
                {analysis.jd_match?.matching_keywords && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Matching keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.jd_match.matching_keywords.slice(0, 5).map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Verdict
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getVerdictColor()}`}>
                  {getVerdictIcon()}
                  <span className="font-semibold capitalize">
                    {analysis.verdict === 'strong' ? 'Strong Candidate' : 
                     analysis.verdict === 'moderate' ? 'Moderate Match' : 'Needs Improvement'}
                  </span>
                </div>
                {analysis.top_priorities && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Top Priorities:</p>
                    <ul className="text-sm space-y-1">
                      {analysis.top_priorities.slice(0, 3).map((priority, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{priority}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="issues" className="mb-10">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="issues">Issues ({analysis.issues?.length || 0})</TabsTrigger>
              <TabsTrigger value="rewrites">Rewrites ({analysis.rewritten_bullets?.length || 0})</TabsTrigger>
              <TabsTrigger value="skills">Skills Gap</TabsTrigger>
              <TabsTrigger value="improvements">Sections</TabsTrigger>
            </TabsList>

            <TabsContent value="issues">
              <Card>
                <CardHeader>
                  <CardTitle>Issues Found</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.issues && analysis.issues.length > 0 ? (
                    <div className="space-y-4">
                      {analysis.issues.map((issue, i) => (
                        <div 
                          key={i} 
                          className={`p-4 rounded-lg border-l-4 ${
                            issue.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            issue.severity === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' :
                            'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {issue.severity === 'high' ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" /> :
                             issue.severity === 'medium' ? <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" /> :
                             <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                            <div>
                              <p className="font-medium">{issue.category}</p>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                              {issue.location && (
                                <p className="text-xs text-muted-foreground mt-1">Location: {issue.location}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No major issues found!</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewrites">
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Bullet Rewrites</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.rewritten_bullets && analysis.rewritten_bullets.length > 0 ? (
                    <div className="space-y-6">
                      {analysis.rewritten_bullets.map((bullet, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-2 line-through">
                            {bullet.original}
                          </p>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            <p className="font-medium text-green-700 dark:text-green-300">
                              {bullet.improved}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {bullet.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No rewrites suggested.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills Gap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Missing Technical Skills</h4>
                      {analysis.skills_gap?.technical && analysis.skills_gap.technical.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills_gap.technical.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-sm rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No technical skills gaps identified.</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Recommended Courses</h4>
                      {analysis.skills_gap?.recommended_courses && analysis.skills_gap.recommended_courses.length > 0 ? (
                        <ul className="space-y-2">
                          {analysis.skills_gap.recommended_courses.slice(0, 3).map((course, i) => (
                            <li key={i} className="text-sm">
                              <span className="font-medium">{course.skill}</span>
                              <span className="text-muted-foreground"> - {course.platform}: {course.course}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No course recommendations.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improvements">
              <Card>
                <CardHeader>
                  <CardTitle>Section Improvements</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.section_improvements && (
                    <div className="space-y-4">
                      {Object.entries(analysis.section_improvements).map(([section, improvements]) => (
                        improvements && improvements.length > 0 && (
                          <div key={section}>
                            <h4 className="font-medium capitalize mb-2">{section}</h4>
                            <ul className="space-y-1">
                              {improvements.map((imp, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <ArrowRight className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                  {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Download Button */}
          <div className="text-center">
            <Button onClick={handleDownload} size="lg" variant="gradient" className="gap-2">
              <Download className="w-5 h-5" />
              Download Full Report (PDF)
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
