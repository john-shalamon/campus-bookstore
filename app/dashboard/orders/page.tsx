"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBasket } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import type { Order, OrderStatus } from "@/lib/types"

export default function OrdersPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [profile])

  const fetchOrders = async () => {
    if (!profile) return

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", profile.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      })
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
    }).format(date)
  }

  if (profile?.role !== "junior") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Only juniors can access their orders.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
      </div>

      {isLoading ? (
        <div>Loading your orders...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No orders yet</CardTitle>
            <CardDescription>You haven't placed any orders yet.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/books">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                Browse Books
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">Delivery Location</h3>
                    <p className="text-muted-foreground text-sm">{order.delivery_location || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Payment Method</h3>
                    <p className="text-muted-foreground text-sm">
                      {order.payment_method === "cod" ? "Cash on Delivery" : "UPI"}
                    </p>
                    <p className="text-xs mt-1">
                      Payment Status:{" "}
                      <span className={order.payment_status === "completed" ? "text-green-600" : "text-yellow-600"}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-bold">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/orders/${order.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

