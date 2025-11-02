"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCard } from "@/components/event-card";
import { Navigation } from "@/components/navigation";

interface Event {
  title: string;
  datetime: string;
  location: string;
  url: string;
}

interface SearchResponse {
  keyword: string;
  count: number;
  events: Event[];
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      setError("検索キーワードを入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/search?keyword=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error("検索に失敗しました");
      }

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            イベント検索
          </h1>
          <p className="text-gray-600">
            Peatixで開催される素敵なイベントを見つけましょう
          </p>
        </div>
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="イベントを検索... (例: AI, 音楽, プログラミング)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10 h-12 text-base"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  検索中...
                </>
              ) : (
                "検索"
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                検索結果
              </h2>
              <p className="text-muted-foreground">
                「{results.keyword}」で <span className="font-semibold text-foreground">{results.count}件</span> のイベントが見つかりました
              </p>
            </div>

            {results.count === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  イベントが見つかりませんでした。別のキーワードで試してください。
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {results.events.map((event, index) => (
                  <EventCard key={index} event={event} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!results && !loading && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="text-xl font-semibold mb-2">イベントを探す</h3>
            <p className="text-muted-foreground">
              キーワードを入力してPeatixのイベントを検索しましょう
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by Peatix Search API</p>
        </div>
      </footer>
    </div>
  );
}
