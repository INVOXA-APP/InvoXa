"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Music,
  AlertCircle,
  RefreshCw,
  Heart,
  Shuffle,
  Repeat,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Track {
  id: string
  title: string
  artist: string
  duration: string
  src: string
  albumArt: string
  description: string
  genre: string
  bpm?: number
  mood: string
  tags: string[]
}

const ambientTracks: Track[] = [
  {
    id: "1",
    title: "Forest Sanctuary",
    artist: "Nature Collective",
    duration: "8:30",
    src: "/audio/ambient-forest-sounds.mp3",
    albumArt: "/forest-ambiance-album-art.png",
    description: "Immerse yourself in a peaceful forest with birds chirping and leaves rustling",
    genre: "Nature",
    bpm: 60,
    mood: "Peaceful",
    tags: ["birds", "forest", "relaxing", "nature"],
  },
  {
    id: "2",
    title: "River Meditation",
    artist: "Flowing Waters",
    duration: "12:15",
    src: "/audio/calm-river-flow.mp3",
    albumArt: "/river-serenade-album-art.png",
    description: "Gentle flowing river sounds perfect for meditation and deep relaxation",
    genre: "Water",
    bpm: 55,
    mood: "Calming",
    tags: ["water", "meditation", "flow", "zen"],
  },
  {
    id: "3",
    title: "Moonlight Sonata",
    artist: "Peaceful Piano",
    duration: "6:45",
    src: "/audio/gentle-piano-melody.mp3",
    albumArt: "/piano-keys-album-art.png",
    description: "Soft piano melodies that enhance concentration and inner peace",
    genre: "Instrumental",
    bpm: 72,
    mood: "Contemplative",
    tags: ["piano", "classical", "focus", "elegant"],
  },
  {
    id: "4",
    title: "Storm's Embrace",
    artist: "Weather Symphony",
    duration: "15:20",
    src: "/audio/distant-thunderstorm.mp3",
    albumArt: "/thunderstorm-album-art.png",
    description: "Distant thunder and gentle rain create the perfect sleep atmosphere",
    genre: "Weather",
    bpm: 45,
    mood: "Cozy",
    tags: ["thunder", "rain", "sleep", "storm"],
  },
  {
    id: "5",
    title: "Temple Bells",
    artist: "Zen Masters",
    duration: "10:00",
    src: "/audio/meditative-chimes.mp3",
    albumArt: "/meditation-chimes-album-art.png",
    description: "Sacred temple bells and chimes for deep meditation practice",
    genre: "Meditation",
    bpm: 40,
    mood: "Spiritual",
    tags: ["bells", "temple", "meditation", "sacred"],
  },
  {
    id: "6",
    title: "Ocean Dreams",
    artist: "Coastal Sounds",
    duration: "18:30",
    src: "/audio/ocean-waves.mp3",
    albumArt: "/underwater-album-art.png",
    description: "Rhythmic ocean waves washing ashore under starlit skies",
    genre: "Water",
    bpm: 50,
    mood: "Dreamy",
    tags: ["ocean", "waves", "beach", "night"],
  },
  {
    id: "7",
    title: "Café Parisien",
    artist: "Urban Ambience",
    duration: "25:00",
    src: "/audio/cafe-ambience.mp3",
    albumArt: "/coffee-shop-album-art.png",
    description: "Cozy Parisian café atmosphere with gentle conversations and coffee brewing",
    genre: "Urban",
    bpm: 80,
    mood: "Social",
    tags: ["café", "paris", "social", "work"],
  },
  {
    id: "8",
    title: "Hearth & Home",
    artist: "Cozy Sounds",
    duration: "20:45",
    src: "/audio/fireplace-crackle.mp3",
    albumArt: "/fireplace-album-art.png",
    description: "Warm fireplace crackling creates the perfect cozy evening atmosphere",
    genre: "Cozy",
    bpm: 35,
    mood: "Warm",
    tags: ["fireplace", "cozy", "home", "winter"],
  },
  {
    id: "9",
    title: "Mountain Whispers",
    artist: "Alpine Winds",
    duration: "14:15",
    src: "/audio/mountain-wind.mp3",
    albumArt: "/cosmic-synth-album-art.png",
    description: "Gentle mountain winds flowing through ancient pine forests",
    genre: "Nature",
    bpm: 48,
    mood: "Majestic",
    tags: ["mountain", "wind", "pine", "altitude"],
  },
  {
    id: "10",
    title: "Cricket Serenade",
    artist: "Night Symphony",
    duration: "22:00",
    src: "/audio/night-crickets.mp3",
    albumArt: "/zen-garden-album-art.png",
    description: "Peaceful night crickets and gentle nature sounds for deep sleep",
    genre: "Nature",
    bpm: 42,
    mood: "Sleepy",
    tags: ["crickets", "night", "sleep", "peaceful"],
  },
  {
    id: "11",
    title: "Zen Garden",
    artist: "Temple Sounds",
    duration: "16:30",
    src: "/audio/zen-bells.mp3",
    albumArt: "/meditation-chimes-album-art.png",
    description: "Traditional Japanese zen garden with temple bells and water features",
    genre: "Meditation",
    bpm: 38,
    mood: "Mindful",
    tags: ["zen", "japanese", "garden", "mindfulness"],
  },
  {
    id: "12",
    title: "Pure Focus",
    artist: "Concentration Labs",
    duration: "30:00",
    src: "/audio/white-noise.mp3",
    albumArt: "/cosmic-synth-album-art.png",
    description: "Clean white noise designed for maximum focus and concentration",
    genre: "Focus",
    bpm: 0,
    mood: "Focused",
    tags: ["white-noise", "focus", "study", "concentration"],
  },
]

export default function AmbientMusicPage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([70])
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string>("All")
  const [selectedMood, setSelectedMood] = useState<string>("All")
  const [audioReady, setAudioReady] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off")
  const [sleepTimer, setSleepTimer] = useState<number | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const genres = ["All", ...Array.from(new Set(ambientTracks.map((track) => track.genre)))]
  const moods = ["All", ...Array.from(new Set(ambientTracks.map((track) => track.mood)))]

  const filteredTracks = ambientTracks.filter((track) => {
    const genreMatch = selectedGenre === "All" || track.genre === selectedGenre
    const moodMatch = selectedMood === "All" || track.mood === selectedMood
    return genreMatch && moodMatch
  })

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
      audioRef.current.removeEventListener("ended", handleTrackEnd)
      audioRef.current.removeEventListener("error", handleAudioError)
      audioRef.current.removeEventListener("canplay", handleCanPlay)
      audioRef.current.removeEventListener("loadstart", handleLoadStart)
      audioRef.current.removeEventListener("canplaythrough", handleCanPlayThrough)
      audioRef.current.src = ""
      audioRef.current = null
    }
  }

  const initializeAudio = (track: Track) => {
    cleanupAudio()

    setError(null)
    setIsLoading(true)
    setAudioReady(false)
    setCurrentTime(0)
    setDuration(0)

    try {
      audioRef.current = new Audio()

      // Set up event listeners
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata)
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
      audioRef.current.addEventListener("ended", handleTrackEnd)
      audioRef.current.addEventListener("error", handleAudioError)
      audioRef.current.addEventListener("canplay", handleCanPlay)
      audioRef.current.addEventListener("loadstart", handleLoadStart)
      audioRef.current.addEventListener("canplaythrough", handleCanPlayThrough)

      // Configure audio settings
      audioRef.current.preload = "metadata"
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
      audioRef.current.crossOrigin = "anonymous"
      audioRef.current.loop = repeatMode === "one"

      // Set source
      audioRef.current.src = track.src
      audioRef.current.load()
    } catch (err) {
      console.error("Error initializing audio:", err)
      setError("Failed to initialize audio player")
      setIsLoading(false)
      toast({
        title: "Audio Error",
        description: "Failed to initialize audio player",
        variant: "destructive",
      })
    }
  }

  const handleLoadStart = () => {
    setIsLoading(true)
    setAudioReady(false)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    setAudioReady(true)
    setError(null)
  }

  const handleCanPlayThrough = () => {
    setIsLoading(false)
    setAudioReady(true)
    setError(null)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0)
      setIsLoading(false)
      setAudioReady(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime || 0)
    }
  }

  const handleTrackEnd = () => {
    setIsPlaying(false)
    setCurrentTime(0)

    if (repeatMode === "one") {
      // Track will loop automatically due to loop property
      return
    }

    if (repeatMode === "all" || isShuffled) {
      const nextTrack = getNextTrack()
      if (nextTrack) {
        playTrack(nextTrack)
      }
    }
  }

  const handleAudioError = (e: Event) => {
    console.error("Audio error event:", e)
    setIsLoading(false)
    setIsPlaying(false)
    setAudioReady(false)

    const target = e.target as HTMLAudioElement
    let errorMessage = "Error loading audio file"

    if (target?.error) {
      switch (target.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Audio loading was aborted"
          break
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading audio. Please check your connection."
          break
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Audio file format not supported or corrupted"
          break
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio source not found. File may be missing."
          break
        default:
          errorMessage = "Unknown audio error occurred"
      }
    }

    setError(errorMessage)
    toast({
      title: "Audio Error",
      description: errorMessage,
      variant: "destructive",
    })
  }

  const getNextTrack = (): Track | null => {
    if (!currentTrack) return null

    if (isShuffled) {
      const availableTracks = filteredTracks.filter((track) => track.id !== currentTrack.id)
      return availableTracks[Math.floor(Math.random() * availableTracks.length)] || null
    }

    const currentIndex = filteredTracks.findIndex((track) => track.id === currentTrack.id)
    return filteredTracks[currentIndex + 1] || filteredTracks[0]
  }

  const getPreviousTrack = (): Track | null => {
    if (!currentTrack) return null

    if (isShuffled) {
      const availableTracks = filteredTracks.filter((track) => track.id !== currentTrack.id)
      return availableTracks[Math.floor(Math.random() * availableTracks.length)] || null
    }

    const currentIndex = filteredTracks.findIndex((track) => track.id === currentTrack.id)
    return filteredTracks[currentIndex - 1] || filteredTracks[filteredTracks.length - 1]
  }

  const playTrack = async (track: Track) => {
    try {
      if (currentTrack?.id !== track.id) {
        setCurrentTrack(track)
        initializeAudio(track)
        return
      }

      if (audioRef.current && audioReady) {
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          await playPromise
          setIsPlaying(true)
          setError(null)
        }
      } else {
        setError("Audio not ready. Please wait and try again.")
      }
    } catch (err) {
      console.error("Error playing audio:", err)
      setIsPlaying(false)

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Please click play to start audio (browser autoplay policy)")
          toast({
            title: "User Interaction Required",
            description: "Click the play button to start audio playback.",
            variant: "default",
          })
        } else if (err.name === "NotSupportedError") {
          setError("Audio format not supported by your browser")
          toast({
            title: "Format Error",
            description: "This audio format is not supported by your browser.",
            variant: "destructive",
          })
        } else {
          setError("Failed to play audio. Please try again.")
          toast({
            title: "Playback Error",
            description: "Unable to play audio. Please try again.",
            variant: "destructive",
          })
        }
      }
    }
  }

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlayPause = () => {
    if (!currentTrack) return

    if (isPlaying) {
      pauseTrack()
    } else {
      playTrack(currentTrack)
    }
  }

  const skipToNext = () => {
    const nextTrack = getNextTrack()
    if (nextTrack) {
      playTrack(nextTrack)
    }
  }

  const skipToPrevious = () => {
    const prevTrack = getPreviousTrack()
    if (prevTrack) {
      playTrack(prevTrack)
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVolume[0] / 100
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume[0] / 100
    }
  }

  const handleSeek = (newTime: number[]) => {
    if (audioRef.current && audioReady) {
      audioRef.current.currentTime = newTime[0]
      setCurrentTime(newTime[0])
    }
  }

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId)
    } else {
      newFavorites.add(trackId)
    }
    setFavorites(newFavorites)
  }

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled)
    toast({
      title: isShuffled ? "Shuffle Off" : "Shuffle On",
      description: isShuffled ? "Playing tracks in order" : "Playing tracks randomly",
    })
  }

  const toggleRepeat = () => {
    const modes: Array<"off" | "one" | "all"> = ["off", "one", "all"]
    const currentIndex = modes.indexOf(repeatMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setRepeatMode(nextMode)

    if (audioRef.current) {
      audioRef.current.loop = nextMode === "one"
    }

    const messages = {
      off: "Repeat off",
      one: "Repeat current track",
      all: "Repeat all tracks",
    }

    toast({
      title: "Repeat Mode",
      description: messages[nextMode],
    })
  }

  const setSleepTimerMinutes = (minutes: number) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current)
    }

    setSleepTimer(minutes)

    sleepTimerRef.current = setTimeout(
      () => {
        pauseTrack()
        setSleepTimer(null)
        toast({
          title: "Sleep Timer",
          description: "Music stopped automatically",
        })
      },
      minutes * 60 * 1000,
    )

    toast({
      title: "Sleep Timer Set",
      description: `Music will stop in ${minutes} minutes`,
    })
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const retryCurrentTrack = () => {
    if (currentTrack) {
      setError(null)
      initializeAudio(currentTrack)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio()
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current)
      }
    }
  }, [])

  // Update volume when mute state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100
    }
  }, [isMuted, volume])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Music className="w-10 h-10" />
            Música Ambiental
          </h1>
          <p className="text-blue-200">Sonidos relajantes para concentración y productividad</p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900/50 border-red-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="flex-1">
                  <p className="text-red-200">{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryCurrentTrack}
                  className="border-red-400 text-red-200 hover:bg-red-800 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={
                  selectedGenre === genre
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-blue-400 text-blue-200 hover:bg-blue-800"
                }
              >
                {genre}
              </Button>
            ))}
          </div>

          {/* Mood Filter */}
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMood(mood)}
                className={
                  selectedMood === mood
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-purple-400 text-purple-200 hover:bg-purple-800"
                }
              >
                {mood}
              </Button>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleShuffle}
              className={`${
                isShuffled ? "bg-green-600 border-green-500" : "border-blue-400 text-blue-200"
              } hover:bg-blue-800`}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleRepeat}
              className={`${
                repeatMode !== "off" ? "bg-green-600 border-green-500" : "border-blue-400 text-blue-200"
              } hover:bg-blue-800`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === "one" && <span className="ml-1 text-xs">1</span>}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSleepTimerMinutes(30)}
              className="border-blue-400 text-blue-200 hover:bg-blue-800"
            >
              <Clock className="w-4 h-4 mr-1" />
              30m
            </Button>
          </div>
        </div>

        {/* Sleep Timer Display */}
        {sleepTimer && (
          <Card className="bg-green-900/50 border-green-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-green-200">Sleep timer: {sleepTimer} minutes remaining</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current)
                    setSleepTimer(null)
                  }}
                  className="border-green-400 text-green-200 hover:bg-green-800 bg-transparent ml-2"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Track Player */}
        {currentTrack && (
          <Card className="bg-black/30 backdrop-blur-sm border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={currentTrack.albumArt || "/placeholder.svg?height=80&width=80&text=🎵"}
                    alt={currentTrack.title}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=80&width=80&text=🎵"
                    }}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">{currentTrack.title}</h3>
                    <p className="text-blue-200">{currentTrack.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-blue-400 text-blue-200">
                        {currentTrack.mood}
                      </Badge>
                      {currentTrack.bpm && currentTrack.bpm > 0 && (
                        <span className="text-xs text-blue-300">{currentTrack.bpm} BPM</span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleSeek}
                      className="w-full"
                      disabled={!audioReady || isLoading}
                    />
                    <div className="flex justify-between text-sm text-blue-200">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleFavorite(currentTrack.id)}
                    className={`${
                      favorites.has(currentTrack.id)
                        ? "bg-red-600 border-red-500 text-white"
                        : "border-blue-400 text-blue-200"
                    } hover:bg-blue-800 bg-transparent`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(currentTrack.id) ? "fill-current" : ""}`} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={skipToPrevious}
                    disabled={isLoading}
                    className="border-blue-400 text-blue-200 hover:bg-blue-800 bg-transparent"
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className="border-blue-400 text-blue-200 hover:bg-blue-800 w-12 h-12 bg-transparent"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={skipToNext}
                    disabled={isLoading}
                    className="border-blue-400 text-blue-200 hover:bg-blue-800 bg-transparent"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleMute}
                      className="border-blue-400 text-blue-200 hover:bg-blue-800 bg-transparent"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Slider value={volume} max={100} step={1} onValueChange={handleVolumeChange} className="w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Track List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTracks.map((track) => (
            <Card
              key={track.id}
              className={`bg-black/20 backdrop-blur-sm border-blue-500/30 hover:bg-black/30 transition-all cursor-pointer ${
                currentTrack?.id === track.id ? "ring-2 ring-blue-400" : ""
              }`}
              onClick={() => playTrack(track)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={track.albumArt || "/placeholder.svg?height=64&width=64&text=🎵"}
                      alt={track.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=64&width=64&text=🎵"
                      }}
                    />
                    {currentTrack?.id === track.id && isPlaying && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(track.id)
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 p-0 hover:bg-black/50"
                    >
                      <Heart
                        className={`w-3 h-3 ${favorites.has(track.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                      />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{track.title}</h3>
                    <p className="text-sm text-blue-200 truncate">{track.artist}</p>
                    <p className="text-xs text-blue-300 mt-1 line-clamp-2">{track.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs border-blue-400 text-blue-200">
                        {track.genre}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-purple-400 text-purple-200">
                        {track.mood}
                      </Badge>
                      <span className="text-xs text-blue-300">{track.duration}</span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {track.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-gray-400 bg-gray-800 px-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTracks.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
            <p className="text-blue-200">Try adjusting your genre or mood filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
