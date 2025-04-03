import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"
import { BookOpenIcon, SearchIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Book } from "@/lib/types"

export default async function BooksPage({
  searchParams,
}: {
  searchParams?: {
    query?: string
    subject?: string
    sort?: string
  }
}) {
  const query = searchParams?.query || ""
  const subject = searchParams?.subject || ""
  const sort = searchParams?.sort || "newest"

  const supabase = createClient()

  let booksQuery = supabase.from("books").select("*").eq("is_available", true)

  if (query) {
    booksQuery = booksQuery.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`)
  }

  if (subject) {
    booksQuery = booksQuery.eq("subject", subject)
  }

  switch (sort) {
    case "price-low":
      booksQuery = booksQuery.order("base_price", { ascending: true })
      break
    case "price-high":
      booksQuery = booksQuery.order("base_price", { ascending: false })
      break
    case "newest":
    default:
      booksQuery = booksQuery.order("created_at", { ascending: false })
      break
  }

  const { data: books } = await booksQuery

  const { data: subjects } = await supabase
    .from("books")
    .select("subject")
    .eq("is_available", true)
    .not("subject", "is", null)

  // Extract unique subjects
  const uniqueSubjects = Array.from(new Set(subjects?.map((item) => item.subject).filter(Boolean)))

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Browse Books</h1>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form action="/books" className="space-y-4">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" name="query" placeholder="Search..." defaultValue={query} className="pl-8" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select name="subject" defaultValue={subject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {uniqueSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select name="sort" defaultValue={sort}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Filter Results
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          {books && books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {books.map((book: Book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <div className="group overflow-hidden rounded-lg border bg-background p-3 transition-colors hover:bg-accent h-full flex flex-col">
                    <div className="aspect-[3/4] relative bg-muted rounded-md overflow-hidden">
                      {book.image_url ? (
                        <Image
                          src={book.image_url || "/placeholder.svg"}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 250px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-secondary/50">
                          <BookOpenIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="pt-3 flex-1 flex flex-col">
                      <h3 className="font-medium line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                      {book.subject && <p className="text-xs text-muted-foreground mt-1">{book.subject}</p>}
                      <p className="mt-auto pt-2 font-medium">₹{book.selling_price ?? book.base_price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No books found</h3>
              <p className="text-muted-foreground">Try changing your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

