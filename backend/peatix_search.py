"""
Peatixイベント検索スクリプト

使い方:
    python peatix_search.py "キーワード"

例:
    python peatix_search.py "AI"
    python peatix_search.py "音楽"
"""

import sys
import asyncio
from playwright.async_api import async_playwright


async def search_peatix_events(keyword: str) -> list:
    """
    Peatixでイベントを検索する

    Args:
        keyword: 検索キーワード

    Returns:
        イベント情報のリスト
    """
    async with async_playwright() as p:
        # ブラウザを起動（ヘッドレスモード）
        browser = await p.chromium.launch(headless=True)

        # User-Agentを設定してbot検出を回避
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = await context.new_page()

        try:
            # 検索ページに移動
            print(f"🔍 '{keyword}' で検索中...")
            await page.goto('https://peatix.com/search?lang=ja', wait_until='load', timeout=60000)
            await asyncio.sleep(3)  # JavaScriptの実行を待つ

            # 検索ボックスにキーワードを入力して検索
            search_box = page.get_by_role('textbox', name='イベントを検索')
            await search_box.fill(keyword)
            await search_box.press('Enter')

            # 検索結果が読み込まれるまで待機
            await page.wait_for_load_state('load', timeout=60000)
            await asyncio.sleep(3)  # 検索結果が表示されるのを待つ

            # 検索結果を取得
            events = []
            event_links = await page.query_selector_all('li a[href*="/event/"]')

            for link in event_links[:10]:  # 最初の10件を取得
                try:
                    # イベント情報を取得
                    event_url = await link.get_attribute('href')

                    # タイトルを取得
                    title_element = await link.query_selector('h3')
                    title = await title_element.inner_text() if title_element else "タイトル不明"

                    # 日時を取得
                    time_element = await link.query_selector('time')
                    time_text = await time_element.inner_text() if time_element else "日時不明"

                    # 場所を取得（オンライン or 会場）
                    location_element = await link.query_selector('span.event-thumb_location')
                    location = await location_element.inner_text() if location_element else "場所不明"

                    events.append({
                        'title': title.strip(),
                        'datetime': time_text.strip(),
                        'location': location,
                        'url': event_url if event_url.startswith('http') else f'https://peatix.com{event_url}'
                    })
                except Exception as e:
                    # 個別のイベント取得エラーはスキップ
                    continue

            return events

        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            return []

        finally:
            await context.close()
            await browser.close()


def print_events(events: list):
    """
    イベント情報を見やすく表示する

    Args:
        events: イベント情報のリスト
    """
    if not events:
        print("\n❌ イベントが見つかりませんでした。")
        return

    print(f"\n✅ {len(events)}件のイベントが見つかりました:\n")
    print("=" * 80)

    for i, event in enumerate(events, 1):
        print(f"\n【{i}】{event['title']}")
        print(f"📅 日時: {event['datetime']}")
        print(f"📍 場所: {event['location']}")
        print(f"🔗 URL: {event['url']}")
        print("-" * 80)


async def main():
    """メイン関数"""
    # コマンドライン引数をチェック
    if len(sys.argv) < 2:
        print("使い方: python peatix_search.py \"キーワード\"")
        print("例: python peatix_search.py \"AI\"")
        sys.exit(1)

    keyword = sys.argv[1]

    # イベントを検索
    events = await search_peatix_events(keyword)

    # 結果を表示
    print_events(events)


if __name__ == "__main__":
    asyncio.run(main())
