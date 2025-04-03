"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { Book, BookCondition } from "@/lib/types"

export default function EditBookPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    edition: "",
    subject: "",
    course: "",
    condition: "" as BookCondition,
    basePrice: "",
    sellingPrice: "",
    description: "",
    imageUrl: "",
    isAvailable: true,
  })

  useEffect(() => {
    fetchBook()
  }, [params.id, profile])

  const fetchBook = async () => {
    if (!profile) return

    try {
      const supabase = createClient()

      const { data, error } = await supabase.from("books").select("*").eq("id", params.id).single()

      if (error) throw error

      if (data.seller_id !== profile.id) {
        toast({
          title: "Access denied",
          description: "You can only edit your own books.",
          variant: "destructive",
        })
        router.push("/dashboard/books")
        return
      }

      setBook(data)
      setFormData({
        title: data.title,
        author: data.author,
        edition: data.edition || "",
        subject: data.subject || "",
        course: data.course || "",
        condition: data.condition || "",
        basePrice: data.base_price.toString(),
        sellingPrice: data.selling_price ? data.selling_price.toString() : "",
        description: data.description || "",
        imageUrl: data.image_url || "",
        isAvailable: data.is_available,
      })
    } catch (error: any) {
      toast({
        title: "Error fetching book",
        description: error.message,
        variant: "destructive",
      })
      router.push("/dashboard/books")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    if (!profile || !book) {
      toast({
        title: "Error",
        description: "Book data or user profile is missing.",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("books")
        .update({
          title: formData.title,
          author: formData.author,
          edition: formData.edition || null,
          subject: formData.subject || null,
          course: formData.course || null,
          condition: formData.condition || null,
          base_price: Number.parseFloat(formData.basePrice),
          selling_price: formData.sellingPrice ? Number.parseFloat(formData.sellingPrice) : null,
          description: formData.description || null,
          image_url: formData.imageUrl || null,
          is_available: formData.isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", book.id)

      if (error) throw error

      toast({
        title: "Book updated",
        description: "Your book has been updated successfully.",
      })

      router.push("/dashboard/books")
    } catch (error: any) {
      toast({
        title: "Error updating book",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Loading book details...</div>
  }

  if (!book || !profile) {
    return <div>Book not found.</div>
  }

  if (profile?.role !== "senior") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only seniors can access this page to edit books.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit Book</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
            <CardDescription>Update the details of your book</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Book title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Author name"
                  required
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edition">Edition</Label>
                <Input
                  id="edition"
                  name="edition"
                  placeholder="e.g. 3rd Edition"
                  value={formData.edition}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g. Computer Science"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  name="course"
                  placeholder="e.g. CS101"
                  value={formData.course}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  value={formData.basePrice}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Optional: If different from base price</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => handleSwitchChange("isAvailable", checked)}
                />
                <Label htmlFor="isAvailable">Available for sale</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add any additional details about the book..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

