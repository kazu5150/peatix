"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Bell, BellOff } from "lucide-react"
import { Navigation } from "@/components/navigation"

type Topic = {
  id: number
  keyword: string
  notification_frequency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 新規作成用の状態
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  const [newFrequency, setNewFrequency] = useState("weekly")
  const [creating, setCreating] = useState(false)

  // トピック一覧を取得
  const fetchTopics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("http://localhost:8000/api/topics")

      if (!response.ok) {
        throw new Error("トピックの取得に失敗しました")
      }

      const data = await response.json()
      setTopics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // 初回ロード時にトピックを取得
  useEffect(() => {
    fetchTopics()
  }, [])

  // トピックを作成
  const handleCreate = async () => {
    if (!newKeyword.trim()) {
      alert("キーワードを入力してください")
      return
    }

    try {
      setCreating(true)
      const response = await fetch("http://localhost:8000/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          notification_frequency: newFrequency,
          is_active: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "トピックの作成に失敗しました")
      }

      // 成功したら一覧を再取得してダイアログを閉じる
      await fetchTopics()
      setIsCreateOpen(false)
      setNewKeyword("")
      setNewFrequency("weekly")
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setCreating(false)
    }
  }

  // トピックのアクティブ状態を切り替え
  const handleToggleActive = async (topic: Topic) => {
    try {
      const response = await fetch(`http://localhost:8000/api/topics/${topic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !topic.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error("更新に失敗しました")
      }

      // 成功したら一覧を再取得
      await fetchTopics()
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました")
    }
  }

  // トピックを削除
  const handleDelete = async (topic: Topic) => {
    if (!confirm(`トピック「${topic.keyword}」を削除しますか？`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/topics/${topic.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("削除に失敗しました")
      }

      // 成功したら一覧を再取得
      await fetchTopics()
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました")
    }
  }

  // 通知頻度のラベル
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "毎日"
      case "weekly":
        return "毎週"
      case "custom":
        return "カスタム"
      default:
        return frequency
    }
  }

  // 通知頻度のバッジ色
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "bg-red-500"
      case "weekly":
        return "bg-blue-500"
      case "custom":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              トピック管理
            </h1>
            <p className="text-gray-600">
              興味のあるトピックを登録して、定期的にイベント情報を受け取ります
            </p>
          </div>

          {/* 新規作成ボタン */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいトピックを作成</DialogTitle>
                <DialogDescription>
                  興味のあるキーワードを入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="keyword">キーワード</Label>
                  <Input
                    id="keyword"
                    placeholder="例: AI, Web開発, デザイン"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frequency">通知頻度</Label>
                  <Select value={newFrequency} onValueChange={setNewFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">毎日</SelectItem>
                      <SelectItem value="weekly">毎週</SelectItem>
                      <SelectItem value="custom">カスタム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  キャンセル
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "作成中..." : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTopics}
              className="mt-2"
            >
              再試行
            </Button>
          </div>
        )}

        {/* トピック一覧 */}
        {!loading && !error && (
          <>
            {topics.length === 0 ? (
              <Card className="text-center py-12">
                <CardHeader>
                  <CardTitle>トピックがありません</CardTitle>
                  <CardDescription>
                    新規作成ボタンから最初のトピックを作成しましょう
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            {topic.keyword}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Badge className={getFrequencyColor(topic.notification_frequency)}>
                              {getFrequencyLabel(topic.notification_frequency)}
                            </Badge>
                            {topic.is_active ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Bell className="mr-1 h-3 w-3" />
                                有効
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                <BellOff className="mr-1 h-3 w-3" />
                                無効
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500">
                        <p>作成日: {new Date(topic.created_at).toLocaleDateString("ja-JP")}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={topic.is_active}
                          onCheckedChange={() => handleToggleActive(topic)}
                        />
                        <Label className="text-sm">通知</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(topic)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
