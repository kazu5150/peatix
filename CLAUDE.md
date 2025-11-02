# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Python-based web scraping tool that searches for events on Peatix (a Japanese event platform). The script uses Playwright for browser automation to extract event information including titles, dates, locations, and URLs.

## Setup and Installation

```bash
# Create virtual environment with uv
uv venv

# Install Python dependencies
uv pip install -r requirements.txt

# Install Playwright browser (required for web scraping)
source .venv/bin/activate && playwright install chromium
```

## Running the Script

```bash
# Activate virtual environment
source .venv/bin/activate

# Basic usage
python peatix_search.py "キーワード"

# Examples
python peatix_search.py "AI"
python peatix_search.py "音楽"
python peatix_search.py "プログラミング"
```

## Architecture

### Single-File Structure
The entire application is contained in `peatix_search.py` with three main components:

1. **`search_peatix_events(keyword: str)`**: Async function that:
   - Launches a headless Chromium browser via Playwright
   - Navigates to Peatix search page (https://peatix.com/search?lang=ja)
   - Fills search textbox and submits query
   - Waits for results to load (networkidle + 2s buffer)
   - Extracts up to 10 events using CSS selectors targeting `li a[href*="/event/"]`
   - Returns list of event dictionaries with title, datetime, location, and URL

2. **`print_events(events: list)`**: Formats and prints event results with emojis and separators

3. **`main()`**: Entry point that validates command-line arguments and orchestrates the search flow

### Key Implementation Details

- **Async/await pattern**: Uses `asyncio` for Playwright's async API
- **Error handling**: Individual event parsing errors are caught and skipped (line 78-80) to ensure partial results on DOM structure changes
- **Selector strategy**: Relies on DOM structure (`h3` for titles, `time` for dates, `generic` tags for locations) which may break if Peatix changes their HTML
- **Wait strategy**: Combines `wait_for_load_state('networkidle')` with explicit `asyncio.sleep(2)` to handle dynamic content loading

## Important Constraints

- **Educational/ethical use only**: This is a web scraping tool and should respect Peatix's terms of service
- **Rate limiting**: No built-in rate limiting - avoid excessive requests
- **Fragile selectors**: DOM selectors (lines 48, 56, 60, 64) are tightly coupled to Peatix's current HTML structure
- **Language**: UI and comments are in Japanese; search works best with Japanese keywords
