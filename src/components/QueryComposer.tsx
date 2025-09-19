"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { 
  Mic, 
  Camera, 
  TextCursorInput, 
  Crop, 
  ArrowUpFromLine,
  FileX2,
  MicVocal
} from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface QueryComposerProps {
  className?: string
  farmerId?: string
  defaultCrop?: string
  defaultLocation?: string
  onQuerySubmit?: (query: QueryPayload) => void
}

interface QueryPayload {
  text?: string
  images: File[]
  audioFile?: File
  transcription?: string
  crop?: string
  plot?: string
  location?: string
  farmerId?: string
  language: string
  season?: string
  problemDescription?: string
}

interface ImagePreview {
  file: File
  url: string
  id: string
}

const INTENT_CHIPS = [
  { label: "കീടനാശിനി ശുപാര്‍ശ", value: "pest_control", en: "Pest Control" },
  { label: "വളം ശുപാര്‍ശ", value: "fertilizer", en: "Fertilizer" },
  { label: "കാലാവസ്ഥ ഉപദേശം", value: "weather", en: "Weather Advice" },
  { label: "സബ്സിഡി വിവരങ്ങൾ", value: "subsidy", en: "Subsidy Info" }
]

const CROPS = [
  { label: "വാഴ", value: "banana", en: "Banana" },
  { label: "നെല്ല്", value: "rice", en: "Rice" },
  { label: "കൊക്കോ", value: "cocoa", en: "Cocoa" },
  { label: "കുരുമുളക്", value: "pepper", en: "Pepper" },
  { label: "മറ്റുള്ളവ", value: "other", en: "Other" }
]

const SEASONS = [
  { label: "വിത്ത് വിതയ്ക്കൽ", value: "sowing", en: "Sowing" },
  { label: "വളർത്തൽ", value: "growing", en: "Growing" },
  { label: "വിളവെടുപ്പ്", value: "harvest", en: "Harvest" },
  { label: "വിശ്രമം", value: "fallow", en: "Fallow" }
]

export default function QueryComposer({ 
  className, 
  farmerId = "farmer_001",
  defaultCrop,
  defaultLocation,
  onQuerySubmit 
}: QueryComposerProps) {
  const { language, t } = useI18n()
  // Input state
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [textInput, setTextInput] = useState("")
  const [images, setImages] = useState<ImagePreview[]>([])
  const [selectedChip, setSelectedChip] = useState<string>("")
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  // Context state
  const [selectedCrop, setSelectedCrop] = useState(defaultCrop || "")
  const [selectedPlot, setSelectedPlot] = useState("")
  const [location, setLocation] = useState(defaultLocation || "")
  const [autoLocation, setAutoLocation] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState("")
  const [problemDescription, setProblemDescription] = useState("")
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [consentGiven, setConsentGiven] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOffline(!navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-detect location
  useEffect(() => {
    if (autoLocation && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
        },
        (error) => {
          console.error("Location detection failed:", error)
        }
      )
    }
  }, [autoLocation])

  const handleChipSelect = useCallback((chipValue: string) => {
    const chip = INTENT_CHIPS.find(c => c.value === chipValue)
    if (chip) {
      setSelectedChip(chipValue)
      const localized =
        chipValue === "pest_control" ? t("chip_pest_control") :
        chipValue === "fertilizer" ? t("chip_fertilizer") :
        chipValue === "weather" ? t("chip_weather") :
        chipValue === "subsidy" ? t("chip_subsidy") : chip.label
      setTextInput(localized)
    }
  }, [t])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9)
        const url = URL.createObjectURL(file)
        setImages(prev => [...prev, { file, url, id }])
      }
    })
    
    if (event.target) {
      event.target.value = ''
    }
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id)
      const removed = prev.find(img => img.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.url)
      }
      return updated
    })
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
        setAudioFile(file)
        stream.getTracks().forEach(track => track.stop())
        
        // Simulate transcription
        setIsTranscribing(true)
        setTimeout(() => {
          setTranscription("വാഴയിൽ ഇലപ്പുള്ളി രോഗം കാണുന്നു") // Mock transcription
          setIsTranscribing(false)
        }, 2000)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

    } catch (error) {
      toast.error(t("err_mic"))
    }
  }, [t])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }, [isRecording])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingDuration(0)
      setAudioFile(null)
      setTranscription("")
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }, [])

  const validateQuery = useCallback(() => {
    const hasText = textInput.trim() || transcription.trim()
    const hasImages = images.length > 0
    const hasAudio = audioFile !== null
    
    if (!hasText && !hasImages && !hasAudio) {
      toast.error(t("err_enter_content"))
      return false
    }
    
    if ((hasImages || location) && !consentGiven) {
      toast.error(t("err_consent"))
      return false
    }
    
    return true
  }, [textInput, transcription, images, audioFile, location, consentGiven, t])

  const handleSubmit = useCallback(async () => {
    if (!validateQuery() || isSubmitting) return

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const queryPayload: QueryPayload = {
        text: textInput.trim() || transcription.trim(),
        images: images.map(img => img.file),
        audioFile: audioFile || undefined,
        transcription: transcription || undefined,
        crop: selectedCrop || undefined,
        plot: selectedPlot || undefined,
        location: location || undefined,
        farmerId,
        language: language,
        season: selectedSeason || undefined,
        problemDescription: problemDescription.trim() || undefined
      }

      // Simulate upload progress while we call the API
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Call our LLM answer API
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: queryPayload.text,
          language: queryPayload.language,
          context: {
            crop: queryPayload.crop,
            season: queryPayload.season,
            location: queryPayload.location,
          },
        })
      })

      if (!res.ok) {
        throw new Error("LLM API failed")
      }

      const data = await res.json()
      const answer: string = data?.answer || ""

      setUploadProgress(100)

      // Notify parent (keeps existing behavior)
      onQuerySubmit?.(queryPayload)

      // Show the fetched answer quickly
      const preview = answer.length > 200 ? answer.slice(0, 200) + "…" : answer
      toast.success(preview || t("toast_success"))

      // Also log full answer for debugging/consumption by other components
      console.debug("LLM Answer:", answer)

      // Reset form
      setTextInput("")
      setTranscription("")
      setAudioFile(null)
      setImages([])
      setSelectedChip("")
      setProblemDescription("")
      setRecordingDuration(0)
      
    } catch (error) {
      toast.error(t("toast_fail"))
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }, [validateQuery, isSubmitting, textInput, transcription, images, audioFile, selectedCrop, selectedPlot, location, farmerId, selectedSeason, problemDescription, onQuerySubmit, language, t])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn("w-full bg-card", className)}>
      <div className="p-6 space-y-6">
        {/* Offline Warning */}
        {isOffline && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <p className="text-sm text-warning font-medium">
              {t("warn_offline_queue")}
            </p>
          </div>
        )}

        {/* Input Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={inputMode === "text" ? "default" : "outline"}
            size="sm"
            onClick={() => setInputMode("text")}
            className="flex items-center gap-2"
          >
            <TextCursorInput className="w-4 h-4" />
            {t("input_text")}
          </Button>
          <Button
            variant={inputMode === "voice" ? "default" : "outline"}
            size="sm"
            onClick={() => setInputMode("voice")}
            className="flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            {t("input_voice")}
          </Button>
        </div>

        {/* Text Input Mode */}
        {inputMode === "text" && (
          <div className="space-y-4">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t("placeholder_question")}
              className="min-h-24 text-base resize-none"
              disabled={isSubmitting}
            />
            
            {/* Quick Intent Chips */}
            <div className="flex flex-wrap gap-2">
              {INTENT_CHIPS.map((chip) => (
                <Badge
                  key={chip.value}
                  variant={selectedChip === chip.value ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => handleChipSelect(chip.value)}
                >
                  {chip.value === "pest_control" ? t("chip_pest_control") :
                   chip.value === "fertilizer" ? t("chip_fertilizer") :
                   chip.value === "weather" ? t("chip_weather") :
                   chip.value === "subsidy" ? t("chip_subsidy") : chip.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Voice Input Mode */}
        {inputMode === "voice" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-muted/30">
              {!isRecording && !audioFile && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-20 h-20 rounded-full"
                  disabled={isSubmitting}
                >
                  <MicVocal className="w-8 h-8" />
                </Button>
              )}
              
              {isRecording && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center animate-pulse">
                    <MicVocal className="w-8 h-8 text-destructive-foreground" />
                  </div>
                  <div className="text-lg font-semibold">
                    {formatDuration(recordingDuration)}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={stopRecording} size="sm">
                      {t("recording_save")}
                    </Button>
                    <Button onClick={cancelRecording} variant="outline" size="sm">
                      {t("recording_cancel")}
                    </Button>
                  </div>
                </div>
              )}
              
              {audioFile && (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("recording_done")} ({formatDuration(recordingDuration)})
                    </span>
                    <Button
                      onClick={() => {
                        setAudioFile(null)
                        setTranscription("")
                        setRecordingDuration(0)
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <FileX2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {isTranscribing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      {t("transcribing")}
                    </div>
                  )}
                  
                  {transcription && (
                    <Textarea
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      className="text-sm"
                      placeholder={t("transcription_placeholder")}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t("images")}</Label>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Camera className="w-4 h-4" />
              {t("add")}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={t("uploaded_image_alt")}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <Button
                    onClick={() => removeImage(image.id)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FileX2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Context Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("crop")}</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger>
                <SelectValue placeholder={t("crop_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {CROPS.map((crop) => (
                  <SelectItem key={crop.value} value={crop.value}>
                    {crop.value === "banana" ? t("crop_banana") :
                     crop.value === "rice" ? t("crop_rice") :
                     crop.value === "cocoa" ? t("crop_cocoa") :
                     crop.value === "pepper" ? t("crop_pepper") :
                     t("crop_other")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("season")}</Label>
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger>
                <SelectValue placeholder={t("season_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((season) => (
                  <SelectItem key={season.value} value={season.value}>
                    {season.value === "sowing" ? t("season_sowing") :
                     season.value === "growing" ? t("season_growing") :
                     season.value === "harvest" ? t("season_harvest") :
                     t("season_fallow")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-location"
              checked={autoLocation}
              onCheckedChange={(checked) => setAutoLocation(checked as boolean)}
            />
            <Label htmlFor="auto-location" className="text-sm">
              {t("auto_locate")}
            </Label>
          </div>
          
          {!autoLocation && (
            <Textarea
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("location_placeholder")}
              className="text-sm"
            />
          )}
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("problem_desc_label")}</Label>
          <Textarea
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            placeholder={t("problem_desc_placeholder")}
            className="text-sm"
          />
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="consent"
            checked={consentGiven}
            onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
          />
          <Label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed">
            {t("consent_text")}
          </Label>
        </div>

        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("uploading")}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center gap-2"
          size="lg"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowUpFromLine className="w-4 h-4" />
          )}
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </Card>
  )
}