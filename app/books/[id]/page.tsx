import { notFound } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { BookOpenIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import AddToCartButton from "./add-to-cart-button"

export default async function BookPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: book, error } = await supabase
    .from("books")
    .select(`
      *,
      profiles(*)
    `)
    .eq("id", params.id)
    .eq("is_available", true)
    .single()

  if (error || !book) {
    notFound()
  }

  const seller = book.profiles

  // Format condition text with proper capitalization
  const formatCondition = (condition: string) => {
    if (!condition) return "Not specified"
    return condition
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-[3/4] relative bg-muted rounded-md overflow-hidden h-[500px]">
          {book.image_url ? (
            <Image
              src={book.image_url || "/placeholder.svg"}
              alt={book.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary/50">
              <BookOpenIcon className="h-24 w-24 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-xl text-muted-foreground mt-1">{book.author}</p>
          </div>

          <div className="flex items-baseline">
            <span className="text-3xl font-bold">₹{book.selling_price ?? book.base_price}</span>
          </div>

          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {book.edition && (
                <>
                  <span className="text-muted-foreground">Edition:</span>
                  <span>{book.edition}</span>
                </>
              )}

              {book.subject && (
                <>
                  <span className="text-muted-foreground">Subject:</span>
                  <span>{book.subject}</span>
                </>
              )}

              {book.course && (
                <>
                  <span className="text-muted-foreground">Course:</span>
                  <span>{book.course}</span>
                </>
              )}

              {book.condition && (
                <>
                  <span className="text-muted-foreground">Condition:</span>
                  <span>{formatCondition(book.condition)}</span>
                </>
              )}
            </div>
          </Card>

          {book.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">{book.description}</p>
            </div>
          )}

          <AddToCartButton book={book} />

          <div>
            <p className="text-sm text-muted-foreground">Seller: {seller.full_name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

