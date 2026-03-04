import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VideoContent() {
  const videos = [
    { id: 1, title: "Top 10 Goals of the Week", url: "https://example.com/video1" },
    { id: 2, title: "Manager's Post-Match Interview", url: "https://example.com/video2" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Content</CardTitle>
      </CardHeader>
      <CardContent>
        {videos.map(video => (
          <div key={video.id} className="mb-2">
            <a href={video.url} className="text-blue-500 hover:underline">{video.title}</a>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}