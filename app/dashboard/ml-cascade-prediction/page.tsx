"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  trainCascadePredictionModel,
  runCascadePrediction,
  simulateCascadeScenario,
  deployPreventionMeasures,
  exportPredictionReport,
} from "./actions"

interface MLModel {
  id: string
  name: string
  type: "neural_network" | "random_forest" | "gradient_boosting" | "lstm" | "transformer"
  status: "training" | "ready" | "deployed" | "updating" | "error"
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  trainingData: number
  lastTrained: Date
  version: string
  features: string[]
  hyperparameters: Record<string, any>
}

interface CascadePrediction {
  id: string
  timestamp: Date
  probability: number
  confidence: number
  riskLevel: "low" | "medium" | "high" | "critical"
  triggerErrors: string[]
  predictedSequence: string[]
  timeToOccurrence: number
  affectedSystems: string[]
  preventionActions: string[]
  modelUsed: string
  features: Record<string, number>
}

interface PreventionMeasure {
  id: string
  name: string
  type: "circuit_breaker" | "load_balancer" | "cache_warmup" | "resource_scaling" | "traffic_shaping"
  status: "active" | "standby" | "triggered" | "disabled"
  effectiveness: number
  triggerThreshold: number
  lastTriggered: Date | null
  successRate: number
  description: string
  automationLevel: "manual" | "semi_auto" | "fully_auto"
}

interface FeatureImportance {
  feature: string
  importance: number
  category: "temporal" | "frequency" | "correlation" | "system" | "user"
  description: string
}

export default function MLCascadePredictionPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("ensemble-v2")
  const [predictionInterval, setPredictionInterval] = useState(30000) // 30 seconds
  const [autoPredict, setAutoPredict] = useState(true)
  const [autoPrevention, setAutoPrevention] = useState(true)
  const [predictionHistory, setPredictionHistory] = useState<CascadePrediction[]>([])
  const [trainingInProgress, setTrainingInProgress] = useState(false)

  const [mlModels, setMlModels] = useState<MLModel[]>([
    {
      id: "ensemble-v2",
      name: "Ensemble Cascade Predictor v2.0",
      type: "gradient_boosting",
      status: "deployed",
      accuracy: 94.7,
      precision: 92.3,
      recall: 96.1,
      f1Score: 94.2,
      trainingData: 15847,
      lastTrained: new Date(Date.now() - 86400000 * 2), // 2 days ago
      version: "2.0.3",
      features: [
        "error_frequency_1h",
        "error_frequency_24h",
        "correlation_strength",
        "system_load",
        "time_of_day",
        "day_of_week",
        "recent_failures",
        "recovery_success_rate",
        "circuit_breaker_states",
        "user_activity_level",
      ],
      hyperparameters: {
        n_estimators: 200,
        max_depth: 12,
        learning_rate: 0.1,
        subsample: 0.8,
        feature_fraction: 0.9,
      },
    },
    {
      id: "lstm-temporal",
      name: "LSTM Temporal Pattern Analyzer",
      type: "lstm",
      status: "ready",
      accuracy: 91.2,
      precision: 89.8,
      recall: 93.4,
      f1Score: 91.6,
      trainingData: 12456,
      lastTrained: new Date(Date.now() - 86400000 * 5), // 5 days ago
      version: "1.8.2",
      features: [
        "error_sequence",
        "temporal_patterns",
        "seasonal_trends",
        "time_series_features",
        "lag_correlations",
        "moving_averages",
        "trend_indicators",
        "cyclical_patterns",
      ],
      hyperparameters: {
        sequence_length: 50,
        hidden_units: 128,
        dropout_rate: 0.2,
        learning_rate: 0.001,
        batch_size: 32,
      },
    },
    {
      id: "transformer-attention",
      name: "Transformer Attention Model",
      type: "transformer",
      status: "training",
      accuracy: 96.8,
      precision: 95.2,
      recall: 98.1,
      f1Score: 96.6,
      trainingData: 23891,
      lastTrained: new Date(Date.now() - 86400000 * 1), // 1 day ago
      version: "3.0.0-beta",
      features: [
        "multi_head_attention",
        "positional_encoding",
        "error_embeddings",
        "context_vectors",
        "attention_weights",
        "transformer_blocks",
        "self_attention",
        "cross_attention",
      ],
      hyperparameters: {
        num_heads: 8,
        num_layers: 6,
        d_model: 512,
        d_ff: 2048,
        dropout: 0.1,
        max_seq_length: 100,
      },
    },
    {
      id: "neural-deep",
      name: "Deep Neural Network Classifier",
      type: "neural_network",
      status: "ready",
      accuracy: 88.9,
      precision: 87.1,
      recall: 91.2,
      f1Score: 89.1,
      trainingData: 9876,
      lastTrained: new Date(Date.now() - 86400000 * 7), // 7 days ago
      version: "1.5.1",
      features: [
        "dense_layers",
        "activation_functions",
        "batch_normalization",
        "regularization",
        "feature_engineering",
        "embedding_layers",
      ],
      hyperparameters: {
        hidden_layers: [256, 128, 64, 32],
        activation: "relu",
        optimizer: "adam",
        learning_rate: 0.001,
        batch_size: 64,
        epochs: 100,
      },
    },
  ])

  const [recentPredictions, setRecentPredictions] = useState<CascadePrediction[]>([
    {
      id: "pred-001",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      probability: 0.87,
      confidence: 0.94,
      riskLevel: "critical",
      triggerErrors: ["Database connection failed", "Server overloaded"],
      predictedSequence: [
        "Database connection failed",
        "Server overloaded",
        "Memory allocation failed",
        "Request timeout",
        "Authentication expired",
      ],
      timeToOccurrence: 420, // 7 minutes
      affectedSystems: ["User Authentication", "Payment Processing", "Data Analytics"],
      preventionActions: [
        "Scale database connections",
        "Activate circuit breakers",
        "Redirect traffic to backup servers",
      ],
      modelUsed: "ensemble-v2",
      features: {
        error_frequency_1h: 23,
        correlation_strength: 0.89,
        system_load: 0.78,
        time_of_day: 14.5,
        recent_failures: 8,
      },
    },
    {
      id: "pred-002",
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      probability: 0.64,
      confidence: 0.81,
      riskLevel: "high",
      triggerErrors: ["Network timeout", "Rate limit exceeded"],
      predictedSequence: ["Network timeout", "Rate limit exceeded", "API quota exceeded", "Service unavailable"],
      timeToOccurrence: 840, // 14 minutes
      affectedSystems: ["API Gateway", "External Integrations"],
      preventionActions: ["Implement rate limiting", "Cache API responses", "Use backup endpoints"],
      modelUsed: "lstm-temporal",
      features: {
        error_frequency_1h: 15,
        correlation_strength: 0.67,
        system_load: 0.45,
        time_of_day: 14.3,
        recent_failures: 4,
      },
    },
    {
      id: "pred-003",
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      probability: 0.42,
      confidence: 0.73,
      riskLevel: "medium",
      triggerErrors: ["Validation error", "Configuration conflict"],
      predictedSequence: ["Validation error", "Configuration conflict", "Service restart required"],
      timeToOccurrence: 1200, // 20 minutes
      affectedSystems: ["Configuration Management"],
      preventionActions: ["Validate configurations", "Rollback recent changes"],
      modelUsed: "neural-deep",
      features: {
        error_frequency_1h: 8,
        correlation_strength: 0.45,
        system_load: 0.32,
        time_of_day: 14.1,
        recent_failures: 2,
      },
    },
  ])

  const [preventionMeasures, setPreventionMeasures] = useState<PreventionMeasure[]>([
    {
      id: "cb-auto-scale",
      name: "Auto-Scale Circuit Breakers",
      type: "circuit_breaker",
      status: "active",
      effectiveness: 92.3,
      triggerThreshold: 0.75,
      lastTriggered: new Date(Date.now() - 1800000), // 30 minutes ago
      successRate: 94.7,
      description: "Automatically adjusts circuit breaker thresholds based on predicted cascade risk",
      automationLevel: "fully_auto",
    },
    {
      id: "lb-traffic-shift",
      name: "Intelligent Traffic Shifting",
      type: "load_balancer",
      status: "standby",
      effectiveness: 88.9,
      triggerThreshold: 0.65,
      lastTriggered: new Date(Date.now() - 3600000), // 1 hour ago
      successRate: 91.2,
      description: "Redistributes traffic away from systems predicted to fail",
      automationLevel: "semi_auto",
    },
    {
      id: "cache-warmup",
      name: "Predictive Cache Warming",
      type: "cache_warmup",
      status: "active",
      effectiveness: 85.6,
      triggerThreshold: 0.55,
      lastTriggered: new Date(Date.now() - 900000), // 15 minutes ago
      successRate: 87.8,
      description: "Pre-loads cache with critical data before predicted failures",
      automationLevel: "fully_auto",
    },
    {
      id: "resource-scale",
      name: "Proactive Resource Scaling",
      type: "resource_scaling",
      status: "triggered",
      effectiveness: 91.7,
      triggerThreshold: 0.7,
      lastTriggered: new Date(Date.now() - 600000), // 10 minutes ago
      successRate: 93.4,
      description: "Scales system resources before predicted load spikes",
      automationLevel: "fully_auto",
    },
    {
      id: "traffic-shape",
      name: "Adaptive Traffic Shaping",
      type: "traffic_shaping",
      status: "standby",
      effectiveness: 79.2,
      triggerThreshold: 0.6,
      lastTriggered: null,
      successRate: 82.1,
      description: "Shapes incoming traffic to prevent system overload",
      automationLevel: "manual",
    },
  ])

  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([
    {
      feature: "correlation_strength",
      importance: 0.234,
      category: "correlation",
      description: "Strength of correlation between current and historical error patterns",
    },
    {
      feature: "error_frequency_1h",
      importance: 0.198,
      category: "frequency",
      description: "Number of errors in the past hour",
    },
    {
      feature: "system_load",
      importance: 0.167,
      category: "system",
      description: "Current system resource utilization",
    },
    {
      feature: "recent_failures",
      importance: 0.145,
      category: "frequency",
      description: "Number of recent system failures",
    },
    {
      feature: "time_of_day",
      importance: 0.123,
      category: "temporal",
      description: "Hour of day (0-23) when prediction is made",
    },
    {
      feature: "circuit_breaker_states",
      importance: 0.089,
      category: "system",
      description: "Current state of all circuit breakers",
    },
    {
      feature: "recovery_success_rate",
      importance: 0.044,
      category: "system",
      description: "Historical success rate of error recovery",
    },
  ])

  const [modelMetrics, setModelMetrics] = useState({
    totalPredictions: 1247,
    accuratePredictions: 1179,
    falsePositives: 34,
    falseNegatives: 34,
    cascadesPrevented: 89,
    avgPredictionTime: 2.3,
    modelUptime: 99.7,
    lastModelUpdate: new Date(Date.now() - 86400000 * 2),
  })

  useEffect(() => {
    if (autoPredict) {
      const interval = setInterval(() => {
        runPrediction()
      }, predictionInterval)
      return () => clearInterval(interval)
    }
  }, [autoPredict, predictionInterval])

  const runPrediction = async () => {
    try {
      const prediction = await runCascadePrediction(selectedModel)
      setRecentPredictions((prev) => [prediction, ...prev.slice(0, 9)]) // Keep last 10

      // Auto-trigger prevention measures if risk is high
      if (autoPrevention && prediction.riskLevel === "critical") {
        await triggerPreventionMeasures(prediction)
      }
    } catch (error) {
      console.error("Prediction failed:", error)
    }
  }

  const triggerPreventionMeasures = async (prediction: CascadePrediction) => {
    const applicableMeasures = preventionMeasures.filter(
      (measure) => measure.status === "active" && prediction.probability >= measure.triggerThreshold,
    )

    for (const measure of applicableMeasures) {
      try {
        await deployPreventionMeasures(measure.id, prediction.id)
        setPreventionMeasures((prev) =>
          prev.map((m) =>
            m.id === measure.id ? { ...m, status: "triggered" as const, lastTriggered: new Date() } : m,
          ),
        )

        toast({
          title: "🛡️ Prevention Measure Activated",
          description: `${measure.name} has been automatically triggered`,
          className: "bg-white border-green-200 text-green-800 shadow-lg",
        })
      } catch (error) {
        console.error(`Failed to trigger prevention measure ${measure.id}:`, error)
      }
    }
  }

  const handleTrainModel = async (modelId: string) => {
    setTrainingInProgress(true)
    try {
      await trainCascadePredictionModel(modelId)
      setMlModels((prev) =>
        prev.map((model) =>
          model.id === modelId
            ? { ...model, status: "ready" as const, lastTrained: new Date(), trainingData: model.trainingData + 500 }
            : model,
        ),
      )

      toast({
        title: "🧠 Model Training Complete",
        description: `${mlModels.find((m) => m.id === modelId)?.name} has been retrained successfully`,
        className: "bg-white border-blue-200 text-blue-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Training Failed",
        description: "Model training failed",
        variant: "destructive",
      })
    } finally {
      setTrainingInProgress(false)
    }
  }

  const handleRunPrediction = async () => {
    setIsLoading(true)
    try {
      const prediction = await runCascadePrediction(selectedModel)
      setRecentPredictions((prev) => [prediction, ...prev.slice(0, 9)])

      toast({
        title: "🔮 Prediction Complete",
        description: `Cascade probability: ${(prediction.probability * 100).toFixed(1)}% (${prediction.riskLevel} risk)`,
        className: `bg-white shadow-lg ${
          prediction.riskLevel === "critical"
            ? "border-red-200 text-red-800"
            : prediction.riskLevel === "high"
              ? "border-orange-200 text-orange-800"
              : "border-blue-200 text-blue-800"
        }`,
      })
    } catch (error) {
      toast({
        title: "❌ Prediction Failed",
        description: "Failed to run cascade prediction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimulateScenario = async () => {
    setIsLoading(true)
    try {
      const result = await simulateCascadeScenario()
      toast({
        title: "🎭 Simulation Complete",
        description: result.description,
        className: "bg-white border-purple-200 text-purple-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Simulation Failed",
        description: "Failed to run cascade simulation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = async () => {
    setIsLoading(true)
    try {
      await exportPredictionReport()
      toast({
        title: "📄 Report Exported",
        description: "ML prediction report has been generated and exported",
        className: "bg-white border-green-200 text-green-800 shadow-lg",
      })
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Failed to export prediction report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
      case "active":
      case "triggered":
        return "bg-green-100 text-green-800"
      case "ready":
      case "standby":
        return "bg-blue-100 text-blue-800"
      case "training":
      case "updating":
        return "bg-yellow-100 text-yellow-800"
      case "error":
      case "disabled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "temporal":
        return "bg-purple-100 text-purple-800"
      case "frequency":
        return "bg-blue-100 text-blue-800"
      case "correlation":
        return "bg-red-100 text-red-800"
      case "system":
        return "bg-green-100 text-green-800"
      case "user":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">ML Cascade Prediction & Prevention</h1>
          <p className="text-gray-600 mt-1">
            Machine learning-powered system to predict and prevent error cascades before they occur
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-predict" className="text-sm">
              Auto Predict
            </Label>
            <Switch
              id="auto-predict"
              checked={autoPredict}
              onCheckedChange={setAutoPredict}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-prevention" className="text-sm">
              Auto Prevention
            </Label>
            <Switch
              id="auto-prevention"
              checked={autoPrevention}
              onCheckedChange={setAutoPrevention}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <Button
            onClick={handleRunPrediction}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Predicting...
              </div>
            ) : (
              <div className="flex items-center gap-2">🔮 Run Prediction</div>
            )}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-black text-xl flex items-center gap-2">🧠 ML System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{modelMetrics.totalPredictions}</div>
              <div className="text-sm text-purple-800">Total Predictions</div>
              <div className="text-xs text-purple-600 mt-1">
                {((modelMetrics.accuratePredictions / modelMetrics.totalPredictions) * 100).toFixed(1)}% accuracy
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{modelMetrics.cascadesPrevented}</div>
              <div className="text-sm text-green-800">Cascades Prevented</div>
              <div className="text-xs text-green-600 mt-1">
                {modelMetrics.falsePositives} false positives, {modelMetrics.falseNegatives} false negatives
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{modelMetrics.avgPredictionTime}s</div>
              <div className="text-sm text-blue-800">Avg Prediction Time</div>
              <div className="text-xs text-blue-600 mt-1">{modelMetrics.modelUptime}% uptime</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">
                {mlModels.filter((m) => m.status === "deployed").length}
              </div>
              <div className="text-sm text-orange-800">Active Models</div>
              <div className="text-xs text-orange-600 mt-1">{mlModels.length} total models</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Prediction Accuracy</span>
                <span className="font-medium">
                  {((modelMetrics.accuratePredictions / modelMetrics.totalPredictions) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={(modelMetrics.accuratePredictions / modelMetrics.totalPredictions) * 100}
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Prevention Success</span>
                <span className="font-medium">
                  {((modelMetrics.cascadesPrevented / (modelMetrics.cascadesPrevented + 12)) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={88.1} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Model Performance</span>
                <span className="font-medium">{modelMetrics.modelUptime}%</span>
              </div>
              <Progress value={modelMetrics.modelUptime} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="predictions">Live Predictions</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
          <TabsTrigger value="prevention">Prevention Measures</TabsTrigger>
          <TabsTrigger value="features">Feature Analysis</TabsTrigger>
          <TabsTrigger value="training">Model Training</TabsTrigger>
          <TabsTrigger value="simulation">Simulation & Testing</TabsTrigger>
        </TabsList>

        {/* Live Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg flex items-center gap-2">
                  🔮 Recent Predictions
                  {autoPredict && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                      Auto-Running
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPredictions.slice(0, 5).map((prediction) => (
                    <div key={prediction.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getRiskColor(prediction.riskLevel)}>
                            {prediction.riskLevel.toUpperCase()} RISK
                          </Badge>
                          <span className="text-sm text-gray-600">{prediction.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {(prediction.probability * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">
                            {(prediction.confidence * 100).toFixed(1)}% confidence
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Trigger Errors:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prediction.triggerErrors.map((error, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {error}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Predicted Sequence:</span>
                          <div className="text-xs text-gray-600 mt-1">
                            {prediction.predictedSequence.slice(0, 3).join(" → ")}
                            {prediction.predictedSequence.length > 3 && " ..."}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Time to Occurrence:</span>
                            <div className="font-medium">{Math.floor(prediction.timeToOccurrence / 60)} minutes</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Affected Systems:</span>
                            <div className="font-medium">{prediction.affectedSystems.length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">⚙️ Prediction Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="model-select">Active Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mlModels
                        .filter((model) => model.status === "deployed" || model.status === "ready")
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} (v{model.version})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prediction Interval: {predictionInterval / 1000}s</Label>
                  <Slider
                    value={[predictionInterval / 1000]}
                    onValueChange={([value]) => setPredictionInterval(value * 1000)}
                    max={300}
                    min={10}
                    step={10}
                    className="w-full mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Auto-Prediction</Label>
                    <Switch
                      checked={autoPredict}
                      onCheckedChange={setAutoPredict}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-Prevention</Label>
                    <Switch
                      checked={autoPrevention}
                      onCheckedChange={setAutoPrevention}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleRunPrediction}
                      disabled={isLoading}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      🔮 Predict Now
                    </Button>
                    <Button onClick={handleExportReport} disabled={isLoading} size="sm" variant="outline">
                      📄 Export Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Predictions Alert */}
          {recentPredictions.some((p) => p.riskLevel === "critical" && Date.now() - p.timestamp.getTime() < 600000) && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTitle className="text-red-800">🚨 Critical Cascade Risk Detected</AlertTitle>
              <AlertDescription className="text-red-700">
                <div className="space-y-2 mt-2">
                  {recentPredictions
                    .filter((p) => p.riskLevel === "critical" && Date.now() - p.timestamp.getTime() < 600000)
                    .slice(0, 2)
                    .map((prediction, index) => (
                      <div key={index}>
                        <strong>
                          {(prediction.probability * 100).toFixed(1)}% probability of cascade in{" "}
                          {Math.floor(prediction.timeToOccurrence / 60)} minutes
                        </strong>
                        <div className="text-sm">
                          Triggers: {prediction.triggerErrors.join(", ")} | Affected:{" "}
                          {prediction.affectedSystems.join(", ")}
                        </div>
                      </div>
                    ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ML Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mlModels.map((model) => (
              <Card key={model.id} className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={getStatusColor(model.status)}>{model.status.toUpperCase()}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Type: <span className="font-medium capitalize">{model.type.replace("_", " ")}</span> | Version:{" "}
                    <span className="font-medium">{model.version}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Accuracy</div>
                      <div className="font-semibold text-green-600">{model.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">F1 Score</div>
                      <div className="font-semibold text-blue-600">{model.f1Score}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Precision</div>
                      <div className="font-semibold text-purple-600">{model.precision}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Recall</div>
                      <div className="font-semibold text-orange-600">{model.recall}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Training Data</span>
                      <span>{model.trainingData.toLocaleString()} samples</span>
                    </div>
                    <Progress value={(model.trainingData / 25000) * 100} className="h-1" />
                  </div>

                  <div className="text-xs text-gray-600">Last trained: {model.lastTrained.toLocaleDateString()}</div>

                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-1">Key Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {model.features.slice(0, 4).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature.replace("_", " ")}
                        </Badge>
                      ))}
                      {model.features.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{model.features.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTrainModel(model.id)}
                      disabled={trainingInProgress || model.status === "training"}
                      className="flex-1"
                    >
                      {model.status === "training" ? "Training..." : "🧠 Retrain"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedModel(model.id)}
                      disabled={model.status !== "ready" && model.status !== "deployed"}
                      className="flex-1"
                    >
                      {selectedModel === model.id ? "✅ Active" : "🎯 Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Prevention Measures Tab */}
        <TabsContent value="prevention" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {preventionMeasures.map((measure) => (
              <Card key={measure.id} className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{measure.name}</CardTitle>
                    <Badge className={getStatusColor(measure.status)}>{measure.status.toUpperCase()}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Type: <span className="font-medium capitalize">{measure.type.replace("_", " ")}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Effectiveness</div>
                      <div className="font-semibold text-green-600">{measure.effectiveness}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Success Rate</div>
                      <div className="font-semibold text-blue-600">{measure.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Trigger Threshold</div>
                      <div className="font-semibold">{(measure.triggerThreshold * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Automation</div>
                      <div className="font-semibold capitalize">{measure.automationLevel.replace("_", " ")}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Effectiveness</span>
                      <span>{measure.effectiveness}%</span>
                    </div>
                    <Progress value={measure.effectiveness} className="h-1" />
                  </div>

                  <div className="text-xs text-gray-600">
                    {measure.lastTriggered
                      ? `Last triggered: ${measure.lastTriggered.toLocaleString()}`
                      : "Never triggered"}
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-700">{measure.description}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={measure.status === "triggered"}
                      className="flex-1 bg-transparent"
                    >
                      {measure.status === "triggered" ? "⚡ Triggered" : "🚀 Test"}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      ⚙️ Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feature Analysis Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-black text-lg">📊 Feature Importance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureImportance.map((feature, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{feature.feature.replace("_", " ")}</span>
                        <Badge className={getCategoryColor(feature.category)} variant="outline">
                          {feature.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{(feature.importance * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <Progress value={feature.importance * 100} className="h-2" />
                    </div>
                    <div className="text-sm text-gray-600">{feature.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">🧠 Training Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="training-model">Select Model to Train</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a model to train" />
                    </SelectTrigger>
                    <SelectContent>
                      {mlModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="training-data">Training Data Size</Label>
                  <Input type="number" placeholder="Number of samples" defaultValue="10000" />
                </div>

                <div>
                  <Label htmlFor="validation-split">Validation Split (%)</Label>
                  <Slider defaultValue={[20]} max={40} min={10} step={5} className="w-full" />
                </div>

                <div>
                  <Label htmlFor="training-epochs">Training Epochs</Label>
                  <Slider defaultValue={[100]} max={500} min={10} step={10} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hyperparameters">Hyperparameters (JSON)</Label>
                  <Textarea
                    placeholder='{"learning_rate": 0.001, "batch_size": 32}'
                    className="h-20"
                    defaultValue='{"learning_rate": 0.001, "batch_size": 32, "dropout": 0.2}'
                  />
                </div>

                <Button
                  onClick={() => handleTrainModel("ensemble-v2")}
                  disabled={trainingInProgress}
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  {trainingInProgress ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Training in Progress...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">🧠 Start Training</div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">📈 Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {trainingInProgress ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Epoch</span>
                        <span>67/100</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Training Loss</div>
                        <div className="font-semibold">0.0234</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Validation Loss</div>
                        <div className="font-semibold">0.0267</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Training Accuracy</div>
                        <div className="font-semibold">94.7%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Validation Accuracy</div>
                        <div className="font-semibold">92.3%</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">Estimated time remaining: 8 minutes 23 seconds</div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No training in progress. Start training a model to see progress here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Simulation & Testing Tab */}
        <TabsContent value="simulation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">🎭 Cascade Simulation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scenario-type">Simulation Scenario</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose simulation scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-load">High Load Cascade</SelectItem>
                      <SelectItem value="db-failure">Database Failure Chain</SelectItem>
                      <SelectItem value="network-partition">Network Partition</SelectItem>
                      <SelectItem value="auth-cascade">Authentication Cascade</SelectItem>
                      <SelectItem value="storage-overflow">Storage Overflow</SelectItem>
                      <SelectItem value="custom">Custom Scenario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="simulation-duration">Simulation Duration (minutes)</Label>
                  <Slider defaultValue={[15]} max={60} min={5} step={5} className="w-full" />
                </div>

                <div>
                  <Label htmlFor="error-intensity">Error Intensity</Label>
                  <Slider defaultValue={[50]} max={100} min={10} step={10} className="w-full" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-errors">Custom Error Sequence</Label>
                  <Textarea
                    placeholder="Enter comma-separated error types..."
                    className="h-20"
                    defaultValue="Database connection failed, Server overloaded, Memory allocation failed"
                  />
                </div>

                <Button
                  onClick={handleSimulateScenario}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Simulating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">🎭 Run Simulation</div>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-black text-lg">📊 Model Testing Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">High Load Cascade Test</span>
                      <Badge className="bg-green-100 text-green-800">✅ Passed</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Prediction Accuracy:</span>
                        <div className="font-semibold">94.7%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Prevention Success:</span>
                        <div className="font-semibold">89.2%</div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Database Failure Chain</span>
                      <Badge className="bg-yellow-100 text-yellow-800">⚠️ Partial</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Prediction Accuracy:</span>
                        <div className="font-semibold">87.3%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Prevention Success:</span>
                        <div className="font-semibold">76.8%</div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Network Partition Test</span>
                      <Badge className="bg-red-100 text-red-800">❌ Failed</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Prediction Accuracy:</span>
                        <div className="font-semibold">72.1%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Prevention Success:</span>
                        <div className="font-semibold">45.6%</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline">
                        📄 Export Results
                      </Button>
                      <Button size="sm" variant="outline">
                        🔄 Run All Tests
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
