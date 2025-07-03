import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function AmbientMusicLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Ambient Music</h1>
            <p className="text-gray-400">Enhance your focus and relaxation with ambient sounds.</p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>

        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Now Playing</CardTitle>
            <p className="text-gray-400">Loading current track...</p>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Skeleton className="h-24 w-24 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex space-x-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Music Library</CardTitle>
            <p className="text-gray-400">Loading tracks...</p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inserted updated code here */}
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
