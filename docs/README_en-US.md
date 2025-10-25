# Naver Blog Image Downloader

[繁體中文](README_zh-TW.md)

A Python tool for automatically downloading original high-quality images from Naver Blog articles.

## Project Overview

This tool uses Playwright for browser automation to extract and download all original images from Naver Blog articles. It supports automatic PC/mobile page switching, image popup handling, parallel downloading, and efficiently batch downloads images while maintaining proper order.

## Features

- Automatically extract all images from Naver Blog articles
- Download original high-quality images (not thumbnails)
- Automatically handle mobile/desktop page switching
- Support parallel downloading for improved efficiency
- Automatically sort images by number to ensure correct order
- Provide detailed fetch and download result statistics
- Debug mode support for troubleshooting

## Project Structure

```text
.
├── data_models.py      # Data model definitions (FetchResult, DownloadResult)
├── downloader.py       # Main program (image fetching and downloading logic)
├── helper.py           # Helper functions (time calculation, debug output, etc.)
├── pyproject.toml      # Project configuration and dependency management
├── .env                # Environment variables configuration file
└── README.md           # Project documentation
```

## Requirements

- Python 3.10 or higher
- uv (Python package and project management tool)

## Environment Variables Configuration

Rename the `.envExample` file to `.env`:

```bash
mv .envExample .env
```

Edit the `.env` file to configure environment variables:

```env
# Debug mode switch (set to any non-empty value to enable Debug mode, e.g., 1 or true)
DEBUG_MODE=
```

- `DEBUG_MODE`: When enabled, detailed execution process messages will be output to the terminal for debugging purposes

## Installation

### 1. Install uv

If you haven't installed uv yet, please refer to the [uv official documentation](https://docs.astral.sh/uv/getting-started/installation/)

### 2. Create Virtual Environment and Install Dependencies

```bash
# Sync project dependencies (will automatically create virtual environment)
uv sync
```

### 3. Install Playwright Browser Execution Environment

```bash
# Install all browsers (including chromium, chromium-headless-shell, chromium-tip-of-tree-headless-shell, chrome, chrome-beta, msedge, msedge-beta, msedge-dev, _bidiChromium, firefox, webkit)
uv run playwright install
```

```bash
# Install specific browser execution environment, e.g., chromium-headless-shell
uv run playwright install chromium-headless-shell
```

## Usage

### Enable Debug Mode

```bash
# Temporarily enable (current execution only)
DEBUG_MODE=1 uv run downloader.py --url "https://blog.naver.com/your-blog-url"
```

Or set `DEBUG_MODE=1` in the `.env` file.

### Run Directly with uv

```bash
# Run with uv run (no need to manually activate virtual environment)
uv run downloader.py --url "https://blog.naver.com/your-blog-url"
```

## Development

### Install Development Dependencies

```bash
uv sync --group dev
```

### Code Formatting and Linting

The project uses Ruff as the code linting and formatting tool:

```bash
# Check code
uv run ruff check .

# Auto-fix issues
uv run ruff check --fix .

# Format code
uv run ruff format .
```

## Notes

- Ensure a stable internet connection
- Downloading a large number of images may take considerable time
- Some Naver Blog articles may have access restrictions
- It is recommended to use Debug mode for troubleshooting

## License

This project is for learning and personal use only. Please comply with Naver's terms of service.
