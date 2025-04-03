"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit2Icon, PlusCircle, Trash2Icon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Book } from "@/lib/types"

export default function BooksPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null)

  useEffect(() => {
    fetchBooks()
  }, [profile])

  const fetchBooks = async () => {
    if (!profile) return

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("seller_id", profile.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setBooks(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching books",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteBookId) return

    try {
      const supabase = createClient()

      const { error } = await supabase.from("books").delete().eq("id", deleteBookId)

      if (error) throw error

      setBooks(books.filter((book) => book.id !== deleteBookId))

      toast({
        title: "Book deleted",
        description: "The book has been removed from your listings.",
      })
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeleteBookId(null)
    }
  }

  if (profile?.role !== "senior") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only seniors can access this page to sell books.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Books</h1>
        <Button asChild>
          <Link href="/dashboard/books/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Book
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div>Loading your books...</div>
      ) : books.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No books listed yet</CardTitle>
            <CardDescription>Start selling your used textbooks by adding your first book.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/books/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Book
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.course || "-"}</TableCell>
                  <TableCell>₹{book.selling_price || book.base_price}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${book.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {book.is_available ? "Available" : "Sold"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/books/${book.id}`}>
                          <Edit2Icon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setDeleteBookId(book.id)}>
                        <Trash2Icon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={!!deleteBookId} onOpenChange={(open) => !open && setDeleteBookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this book from your listings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

