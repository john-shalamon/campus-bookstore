"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, ShoppingBasket, TruckIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Order, OrderItem, OrderStatus, Book } from "@/lib/types"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<(OrderItem & { book: Book })[]>([])

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id, profile])

  const fetchOrderDetails = async () => {
    if (!profile) return

    try {
      const supabase = createClient()

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single()

      if (orderError) throw orderError

      if (orderData.buyer_id !== profile.id) {
        toast({
          title: "Access denied",
          description: "You can only view your own orders.",
          variant: "destructive",
        })
        router.push("/dashboard/orders")
        return
      }

      setOrder(orderData)

      // Fetch order items with book details
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          book:books(*)
        `)
        .eq("order_id", params.id)

      if (itemsError) throw itemsError

      setOrderItems(itemsData)
    } catch (error: any) {
      toast({
        title: "Error fetching order details",
        description: error.message,
        variant: "destructive",
      })
      router.push("/dashboard/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColorClass = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return <div>Loading order details...</div>
  }

  if (!order || !profile) {
    return <div>Order not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>Placed on {formatDate(order.created_at)}</CardDescription>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColorClass(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium text-sm">Delivery Location</h3>
              <p className="text-muted-foreground">{order.delivery_location || "Not specified"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Payment Method</h3>
              <p className="text-muted-foreground">{order.payment_method === "cod" ? "Cash on Delivery" : "UPI"}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm">Payment Status</h3>
              <p className={order.payment_status === "completed" ? "text-green-600" : "text-yellow-600"}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-4">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.book.title}</div>
                        <div className="text-sm text-muted-foreground">{item.book.author}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total Amount
                  </TableCell>
                  <TableCell className="text-right font-bold">₹{order.total_amount.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Order Status</h3>
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`border rounded-md p-4 text-center ${order.status === "pending" || order.status === "confirmed" || order.status === "delivered" ? "border-green-500" : ""}`}
              >
                <div className="flex justify-center mb-2">
                  <CheckCircle2Icon
                    className={`h-6 w-6 ${order.status === "pending" || order.status === "confirmed" || order.status === "delivered" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                </div>
                <p className="text-sm font-medium">Order Placed</p>
              </div>
              <div
                className={`border rounded-md p-4 text-center ${order.status === "confirmed" || order.status === "delivered" ? "border-green-500" : ""}`}
              >
                <div className="flex justify-center mb-2">
                  <ShoppingBasket
                    className={`h-6 w-6 ${order.status === "confirmed" || order.status === "delivered" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                </div>
                <p className="text-sm font-medium">Order Confirmed</p>
              </div>
              <div
                className={`border rounded-md p-4 text-center ${order.status === "delivered" ? "border-green-500" : ""}`}
              >
                <div className="flex justify-center mb-2">
                  <TruckIcon
                    className={`h-6 w-6 ${order.status === "delivered" ? "text-green-500" : "text-muted-foreground"}`}
                  />
                </div>
                <p className="text-sm font-medium">Order Delivered</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

