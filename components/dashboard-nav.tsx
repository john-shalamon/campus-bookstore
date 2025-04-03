"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenIcon, type LucideIcon, ShoppingBasket, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export function DashboardNav() {
  const pathname = usePathname()
  const { profile } = useAuth()

  const commonItems: NavItem[] = [
    {
      title: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  const seniorItems: NavItem[] = [
    {
      title: "My Books",
      href: "/dashboard/books",
      icon: BookOpenIcon,
    },
  ]

  const juniorItems: NavItem[] = [
    {
      title: "My Orders",
      href: "/dashboard/orders",
      icon: ShoppingBasket,
    },
  ]

  const items = [
    ...commonItems,
    ...(profile?.role === "senior" ? seniorItems : []),
    ...(profile?.role === "junior" ? juniorItems : []),
  ]

  if (!items?.length) {
    return null
  }

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Link key={index} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", pathname === item.href && "bg-muted font-medium")}
            >
              <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
              {item.title}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

