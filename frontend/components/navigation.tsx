"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Peatix AI</span>
          </Link>

          {/* ナビゲーションリンク */}
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                イベント検索
              </Button>
            </Link>
            <Link href="/topics">
              <Button
                variant={pathname === "/topics" ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Bookmark className="h-4 w-4" />
                トピック管理
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
