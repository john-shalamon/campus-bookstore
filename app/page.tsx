import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import type { Book } from "@/lib/types"
import { BookOpenIcon } from "lucide-react"

export default async function Home() {
  const supabase = createClient()

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(6)

  return (
    <div className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Campus Bookstore
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Buy and sell used textbooks on campus. Save money and help your fellow students.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/books">
                <Button size="lg">Browse Books</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-12 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">1</div>
            <h3 className="mt-4 text-xl font-bold">List Your Books</h3>
            <p className="mt-2 text-gray-500">Seniors can list their used textbooks and set base prices.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">2</div>
            <h3 className="mt-4 text-xl font-bold">Browse & Order</h3>
            <p className="mt-2 text-gray-500">Juniors can browse available books and place orders.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">3</div>
            <h3 className="mt-4 text-xl font-bold">Campus Delivery</h3>
            <p className="mt-2 text-gray-500">We'll deliver the books to you in class. Pay by COD or UPI.</p>
          </div>
        </div>
      </section>

      {books && books.length > 0 && (
        <section className="container px-4 py-12 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Recent Books</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book: Book) => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <div className="group overflow-hidden rounded-lg border bg-background p-3 transition-colors hover:bg-accent">
                  <div className="aspect-[3/4] relative bg-muted rounded-md overflow-hidden">
                    {book.image_url ? (
                      <Image
                        src={book.image_url || "/placeholder.svg"}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-secondary/50">
                        <BookOpenIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="pt-3">
                    <h3 className="font-medium line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                    <p className="mt-2 font-medium">₹{book.selling_price ?? book.base_price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/books">
              <Button>View All Books</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

