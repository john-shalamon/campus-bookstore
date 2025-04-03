"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import type { PaymentMethod } from "@/lib/types"

type CartItem = {
  id: string
  title: string
  author: string
  price: number
  image?: string
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    deliveryLocation: "",
    paymentMethod: "cod" as PaymentMethod,
  })

  useEffect(() => {
    // Check if user is logged in and is a junior
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (profile?.role !== "junior") {
      toast({
        title: "Access denied",
        description: "Only juniors can access checkout.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Load cart from localStorage
    try {
      const storedCart = localStorage.getItem("cart")
      const parsedCart = storedCart ? JSON.parse(storedCart) : []

      if (parsedCart.length === 0) {
        toast({
          title: "Cart is empty",
          description: "Add some books to your cart before checking out.",
          variant: "destructive",
        })
        router.push("/cart")
        return
      }

      setCart(parsedCart)
    } catch (error) {
      console.error("Error loading cart:", error)
      setCart([])
    } finally {
      setIsLoading(false)
    }
  }, [user, profile, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentMethodChange = (value: PaymentMethod) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user || !profile) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          status: "pending",
          payment_method: formData.paymentMethod,
          payment_status: "pending",
          delivery_location: formData.deliveryLocation,
          total_amount: calculateTotal(),
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        book_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      localStorage.removeItem("cart")

      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and will be delivered soon.",
      })

      router.push("/dashboard/orders")
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="container py-10">Loading checkout...</div>
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Enter where you want your books to be delivered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryLocation">Delivery Location *</Label>
                <Textarea
                  id="deliveryLocation"
                  name="deliveryLocation"
                  placeholder="e.g. Room 101, Block A, Computer Science Department"
                  required
                  rows={3}
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                />
                <p className="text-sm text-muted-foreground">
                  Specify your classroom, department, or where you want to receive your books on campus.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handlePaymentMethodChange(value as PaymentMethod)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer">
                      Cash on Delivery (COD)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="cursor-pointer">
                      UPI Payment
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-sm text-muted-foreground">
                  {formData.paymentMethod === "cod"
                    ? "Pay with cash when you receive your books."
                    : "You will receive UPI payment details for completing your payment."}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity > 1 ? `${item.quantity} × ₹${item.price.toFixed(2)}` : `₹${item.price.toFixed(2)}`}
                    </div>
                  </div>
                  <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>Free</span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

