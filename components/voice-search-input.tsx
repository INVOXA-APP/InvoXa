"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Mic,
  MicOff,
  Volume2,
  Wand2,
  Brain,
  Sparkles,
  Filter,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VoiceSearchEngine, type VoiceSearchResult } from "@/lib/voice-search-engine"
import type { VoiceSearchState } from "@/types/search-suggestions"

interface VoiceSearchInputProps {
  onVoiceResult: (result: VoiceSearchResult) => void
  onTranscriptChange: (transcript: string, isFinal: boolean) => void
  disabled?: boolean
  language?: string
}

export function VoiceSearchInput({
  onVoiceResult,
  onTranscriptChange,
  disabled = false,
  language = "en-US",
}: VoiceSearchInputProps) {
  const [voiceState, setVoiceState] = useState<VoiceSearchState>({
    isListening: false,
    transcript: "",
    isProcessing: false,
    error: null,
    optimizedQuery: null,
    confidence: 0,
    businessTerms: [],
    suggestedFilters: {},
  })

  const [isSupported, setIsSupported] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)

  const voiceEngineRef = useRef<VoiceSearchEngine | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()
  const { toast } = useToast()

  useEffect(() => {
    // Initialize voice engine
    if (VoiceSearchEngine.isVoiceSearchSupported()) {
      voiceEngineRef.current = new VoiceSearchEngine()
      setIsSupported(true)
    } else {
      setIsSupported(false)
      toast({
        title: "Voice Search Not Supported",
        description: "Your browser doesn't support voice search functionality",
        variant: "destructive",
      })
    }

    return () => {
      stopListening()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      analyserRef.current.fftSize = 256
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateAudioLevel = () => {
        if (analyserRef.current && voiceState.isListening) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / bufferLength
          setAudioLevel(Math.min(100, (average / 255) * 100))
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
        }
      }

      updateAudioLevel()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopAudioVisualization = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (analyserRef.current) {
      analyserRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    setAudioLevel(0)
  }

  const startListening = () => {
    if (!voiceEngineRef.current || !isSupported || disabled) return

    setVoiceState((prev) => ({
      ...prev,
      isListening: true,
      transcript: "",
      error: null,
      optimizedQuery: null,
    }))

    startAudioVisualization()

    voiceEngineRef.current.startListening(
      (transcript, isFinal) => {
        setVoiceState((prev) => ({
          ...prev,
          transcript,
        }))
        onTranscriptChange(transcript, isFinal)

        if (isFinal) {
          processVoiceInput(transcript)
        }
      },
      (error) => {
        setVoiceState((prev) => ({
          ...prev,
          isListening: false,
          error,
        }))
        stopAudioVisualization()
        toast({
          title: "Voice Recognition Error",
          description: error,
          variant: "destructive",
        })
      },
      () => {
        // onStart
        toast({
          title: "Listening...",
          description: "Speak your search query now",
          duration: 2000,
        })
      },
      () => {
        // onEnd
        setVoiceState((prev) => ({
          ...prev,
          isListening: false,
        }))
        stopAudioVisualization()
      },
    )
  }

  const stopListening = () => {
    if (voiceEngineRef.current) {
      voiceEngineRef.current.stopListening()
    }
    stopAudioVisualization()
    setVoiceState((prev) => ({
      ...prev,
      isListening: false,
    }))
  }

  const processVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return

    setVoiceState((prev) => ({
      ...prev,
      isProcessing: true,
    }))

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 10
      })
    }, 100)

    try {
      const result = await VoiceSearchEngine.optimizeVoiceQuery(transcript)

      setVoiceState((prev) => ({
        ...prev,
        isProcessing: false,
        optimizedQuery: result.optimizedQuery,
        confidence: result.confidence,
        businessTerms: result.businessTermsDetected,
        suggestedFilters: result.suggestedFilters,
      }))

      setProcessingProgress(100)
      setTimeout(() => setProcessingProgress(0), 1000)

      onVoiceResult(result)

      toast({
        title: "Voice Search Processed",
        description: `Query optimized with ${Math.round(result.confidence * 100)}% confidence`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Error processing voice input:", error)
      setVoiceState((prev) => ({
        ...prev,
        isProcessing: false,
        error: "Failed to process voice input",
      }))
      clearInterval(progressInterval)
      setProcessingProgress(0)
    }
  }

  const toggleListening = () => {
    if (voiceState.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50 border-green-200"
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getAudioLevelColor = (level: number) => {
    if (level > 70) return "bg-red-500"
    if (level > 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (!isSupported) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Voice Search Not Available</span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            Your browser doesn't support voice recognition. Please use a modern browser like Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`transition-all duration-300 ${
        voiceState.isListening
          ? "border-blue-300 bg-blue-50 shadow-lg"
          : voiceState.error
            ? "border-red-300 bg-red-50"
            : "border-gray-200"
      }`}
    >
      <CardContent className="p-4">
        {/* Voice Input Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleListening}
              disabled={disabled || voiceState.isProcessing}
              className={`relative ${
                voiceState.isListening
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {voiceState.isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
              {voiceState.isListening ? "Stop Listening" : "Start Voice Search"}

              {voiceState.isListening && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>

            {voiceState.isListening && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${getAudioLevelColor(audioLevel)}`}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{Math.round(audioLevel)}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {voiceState.confidence > 0 && (
              <Badge className={`text-xs ${getConfidenceColor(voiceState.confidence)}`}>
                <Target className="w-3 h-3 mr-1" />
                {Math.round(voiceState.confidence * 100)}% confidence
              </Badge>
            )}
            {voiceState.businessTerms.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                {voiceState.businessTerms.length} terms
              </Badge>
            )}
          </div>
        </div>

        {/* Processing Progress */}
        {voiceState.isProcessing && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-700">Processing voice input...</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        {/* Transcript Display */}
        {voiceState.transcript && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Voice Transcript</span>
              {voiceState.isListening && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  Listening...
                </Badge>
              )}
            </div>
            <div className="bg-white border rounded-lg p-3">
              <p className="text-sm text-gray-900 font-mono">
                {voiceState.transcript}
                {voiceState.isListening && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />}
              </p>
            </div>
          </div>
        )}

        {/* Optimized Query */}
        {voiceState.optimizedQuery && voiceState.optimizedQuery !== voiceState.transcript && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">AI-Optimized Query</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-900 font-mono">{voiceState.optimizedQuery}</p>
            </div>
          </div>
        )}

        {/* Business Terms Detected */}
        {voiceState.businessTerms.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Business Terms Detected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {voiceState.businessTerms.map((term, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Filters */}
        {Object.keys(voiceState.suggestedFilters).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Suggested Filters</span>
            </div>
            <div className="space-y-2">
              {Object.entries(voiceState.suggestedFilters).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {key}
                  </Badge>
                  <span className="text-xs text-gray-600">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {voiceState.error && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Voice Recognition Error</span>
            </div>
            <p className="text-xs text-red-600 mt-1">{voiceState.error}</p>
          </div>
        )}

        {/* Status and Tips */}
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3" />
              Voice ready
            </span>
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              AI optimization
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Smart filters
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Language: {language}</span>
          </div>
        </div>

        {/* Voice Tips */}
        {!voiceState.transcript && !voiceState.isListening && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">Voice Search Tips:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>• Speak clearly: "Find invoices from last month"</p>
              <p>• Use business terms: "Show client payment history"</p>
              <p>• Include time filters: "Get expense reports from this week"</p>
              <p>• Be specific: "Search for overdue invoices from John Smith"</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
