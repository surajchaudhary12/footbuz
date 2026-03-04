// /app/components/UploadArticle.tsx

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UploadArticle() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
  })
  const [image, setImage] = useState<File | null>(null)
  const [status, setStatus] = useState<{ type: string; message: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setStatus(null)

    const data = new FormData()
    data.append('title', formData.title)
    data.append('content', formData.content)
    data.append('author', formData.author)
    if (image) {
      data.append('image', image)
    }

    try {
      const res = await fetch('/api/uploadArticle', {
        method: 'POST',
        body: data,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Something went wrong')
      }

      const result = await res.json()
      setStatus({ type: 'success', message: 'Article uploaded successfully!' })
      setFormData({ title: '', content: '', author: '' })
      setImage(null)
    } catch (error: any) {
      console.error('Error uploading article:', error)
      setStatus({ type: 'error', message: error.message || 'Failed to upload article' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Article</CardTitle>
      </CardHeader>
      <CardContent>
        {status && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'success'}>
            <AlertTitle>{status.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter article title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Enter article content"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Author</label>
            <Input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              placeholder="Author name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
            />
            {image && <p className="text-sm text-gray-500 mt-1">{image.name}</p>}
          </div>

          <div>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Article'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}