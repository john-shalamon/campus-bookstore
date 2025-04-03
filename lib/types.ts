export type UserRole = "senior" | "junior"

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole | null
  phone: string | null
  created_at: string
  updated_at: string
}

export type BookCondition = "new" | "like new" | "good" | "fair" | "poor"

export type Book = {
  id: string
  title: string
  author: string
  edition: string | null
  subject: string | null
  course: string | null
  condition: BookCondition | null
  base_price: number
  selling_price: number | null
  description: string | null
  image_url: string | null
  is_available: boolean
  seller_id: string
  created_at: string
  updated_at: string
}

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled"
export type PaymentMethod = "cod" | "upi"
export type PaymentStatus = "pending" | "completed"

export type Order = {
  id: string
  buyer_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  delivery_location: string | null
  total_amount: number
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  book_id: string
  quantity: number
  price: number
  created_at: string
}

export type BookWithDetails = Book & {
  seller: Profile
}

export type OrderWithItems = Order & {
  items: (OrderItem & { book: Book })[]
}

