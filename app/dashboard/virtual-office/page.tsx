"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Users,
  MessageSquare,
  Share,
  Settings,
  AlertCircle,
  RefreshCw,
  Camera,
  Monitor,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLanguageCurrency } from "@/contexts/language-currency-context"

interface Participant {
  id: string
  name: string
  avatar: string
  isMuted: boolean
  isVideoOn: boolean
  isHost: boolean
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: Date
}

export default function VirtualOfficePage() {
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: "1",
      name: "Alice Johnson",
      avatar: "/placeholder-human-figure.png",
      isMuted: false,
      isVideoOn: true,
      isHost: true,
    },
    {
      id: "2",
      name: "Bob Williams",
      avatar: "/placeholder-human-figure.png",
      isMuted: true,
      isVideoOn: false,
      isHost: false,
    },
  ])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "Bob Williams",
      message: "Reporting for duty!",
      timestamp: new Date(Date.now() - 120000),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const [hasMediaPermissions, setHasMediaPermissions] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()
  const { t } = useLanguageCurrency()

  const checkMediaPermissions = async () => {
    try {
      const permissions = await Promise.all([
        navigator.permissions.query({ name: "camera" as PermissionName }),
        navigator.permissions.query({ name: "microphone" as PermissionName }),
      ])

      const cameraPermission = permissions[0].state
      const micPermission = permissions[1].state

      setHasMediaPermissions(cameraPermission === "granted" && micPermission === "granted")

      return cameraPermission === "granted" && micPermission === "granted"
    } catch (error) {
      console.error("Error checking permissions:", error)
      return false
    }
  }

  const requestMediaAccess = async () => {
    setIsLoadingMedia(true)
    setMediaError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(console.error)
      }

      setIsVideoOn(true)
      setIsMuted(false)
      setHasMediaPermissions(true)
      setMediaError(null)

      toast({
        title: t("media-access-granted"),
        description: t("camera-microphone-active"),
        className: "bg-green-50 border-green-200 text-green-800",
      })
    } catch (error) {
      console.error("Error accessing media devices:", error)

      let errorMessage = t("media-access-error")

      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Camera and microphone access denied. Please allow permissions in your browser settings."
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera or microphone found. Please check your devices."
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera or microphone is already in use by another application."
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Camera or microphone constraints cannot be satisfied."
        } else if (error.name === "SecurityError") {
          errorMessage = "Media access blocked due to security restrictions."
        }
      }

      setMediaError(errorMessage)
      setHasMediaPermissions(false)

      toast({
        title: t("media-access-error"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingMedia(false)
    }
  }

  const stopMediaAccess = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsVideoOn(false)
    setIsMuted(true)
    setHasMediaPermissions(false)
  }

  const toggleVideo = async () => {
    if (!hasMediaPermissions) {
      await requestMediaAccess()
      return
    }

    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    }
  }

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      setIsScreenSharing(true)

      screenStream.getVideoTracks()[0].addEventListener("ended", () => {
        setIsScreenSharing(false)
      })

      toast({
        title: "Screen Sharing Started",
        description: "Your screen is now being shared",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      })
    } catch (error) {
      console.error("Error starting screen share:", error)
      toast({
        title: "Screen Share Error",
        description: "Unable to start screen sharing",
        variant: "destructive",
      })
    }
  }

  const joinMeeting = async () => {
    setIsInMeeting(true)
    await requestMediaAccess()

    toast({
      title: t("joined-meeting"),
      description: t("welcome-virtual-office"),
      className: "bg-blue-50 border-blue-200 text-blue-800",
    })
  }

  const leaveMeeting = () => {
    setIsInMeeting(false)
    stopMediaAccess()
    setIsScreenSharing(false)

    toast({
      title: t("left-meeting"),
      description: t("left-virtual-office"),
      className: "bg-gray-50 border-gray-200 text-gray-800",
    })
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: t("you"),
        message: newMessage.trim(),
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, message])
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const retryMediaAccess = () => {
    setMediaError(null)
    requestMediaAccess()
  }

  // Check permissions on mount
  useEffect(() => {
    checkMediaPermissions()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaAccess()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t("virtual-office")}</h1>
          <div className="flex items-center gap-2">
            {isInMeeting ? (
              <Button onClick={leaveMeeting} variant="destructive">
                <PhoneOff className="w-4 h-4 mr-2" />
                {t("leave-meeting")}
              </Button>
            ) : (
              <Button onClick={joinMeeting} className="bg-blue-600 hover:bg-blue-700">
                <Phone className="w-4 h-4 mr-2" />
                {t("join-meeting")}
              </Button>
            )}
          </div>
        </div>

        {/* Media Error Display */}
        {mediaError && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">{t("media-access-error")}</p>
                  <p className="text-red-700 text-sm">{mediaError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryMediaAccess}
                  className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("try-again")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  {t("live-meeting-room")}
                  {isInMeeting && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {t("live")}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                  {isInMeeting ? (
                    <>
                      {hasMediaPermissions && isVideoOn ? (
                        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-white">
                            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">Video Feed Placeholder</p>
                            <p className="text-sm opacity-75">
                              {!hasMediaPermissions ? "Camera access required" : "Camera is off"}
                            </p>
                          </div>
                        </div>
                      )}

                      {isScreenSharing && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-600 text-white">
                            <Monitor className="w-3 h-3 mr-1" />
                            Screen Sharing
                          </Badge>
                        </div>
                      )}

                      {isLoadingMedia && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <p>Connecting to camera...</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">{t("ready-to-go")}</p>
                        <p className="text-sm opacity-75">{t("click-join-meeting")}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meeting Controls */}
                {isInMeeting && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      size="icon"
                      onClick={toggleMute}
                      className="rounded-full"
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant={!isVideoOn ? "destructive" : "outline"}
                      size="icon"
                      onClick={toggleVideo}
                      className="rounded-full"
                      disabled={isLoadingMedia}
                    >
                      {isLoadingMedia ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : !isVideoOn ? (
                        <VideoOff className="w-4 h-4" />
                      ) : (
                        <Video className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant={isScreenSharing ? "default" : "outline"}
                      size="icon"
                      onClick={startScreenShare}
                      className="rounded-full"
                    >
                      <Share className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shared Notes */}
            <Card>
              <CardHeader>
                <CardTitle>{t("shared-notes")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{t("collaborative-notes")}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">{t("discuss-q4")}</p>
                    <p className="text-sm">{t("review-timeline")}</p>
                    <p className="text-sm">{t("plan-team-building")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("participants")}
                  <Badge variant="outline">{participants.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={participant.avatar || "/placeholder.svg"}
                        alt={participant.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=32&width=32&text=👤"
                        }}
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          isInMeeting ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {participant.name}
                        {participant.isHost && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t("host")}
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-1">
                        {participant.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                        {!participant.isVideoOn && <VideoOff className="w-3 h-3 text-red-500" />}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Current User */}
                {isInMeeting && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {t("you")}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{t("you")}</p>
                        <div className="flex items-center gap-1">
                          {isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                          {!isVideoOn && <VideoOff className="w-3 h-3 text-red-500" />}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Team Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {t("team-chat")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{message.sender}</span>
                        <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{message.message}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t("type-message")}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
