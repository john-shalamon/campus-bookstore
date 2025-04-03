"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function AddToCartButton({ book }: { book: any }) {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to your cart.",
      })
      router.push("/auth/login")
      return
    }

    if (profile?.role !== "junior") {
      toast({
        title: "Not allowed",
        description: "Only juniors can purchase books.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // In a real implementation, you would add this to a cart table in Supabase
    // For now, we'll use localStorage
    try {
      // Get existing cart from localStorage
      const existingCart = localStorage.getItem("cart")
      const cart = existingCart ? JSON.parse(existingCart) : []

      // Check if book is already in cart
      const existingItem = cart.find((item: any) => item.id === book.id)

      if (existingItem) {
        toast({
          title: "Already in cart",
          description: "This book is already in your cart.",
        })
      } else {
        // Add book to cart
        cart.push({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.selling_price ?? book.base_price,
          image: book.image_url,
          quantity: 1,
        })

        localStorage.setItem("cart", JSON.stringify(cart))

        toast({
          title: "Added to cart",
          description: "Book has been added to your cart.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If the seller is the current user, disable the add to cart button
  const isSeller = user && book.seller_id === user.id

  return (
    <Button onClick={handleAddToCart} disabled={isLoading || isSeller} className="w-full md:w-auto" size="lg">
      <ShoppingCart className="h-5 w-5 mr-2" />
      {isSeller ? "You are the seller" : "Add to Cart"}
    </Button>
  )
}

