# Naver Blog Image Downloader

## Prerequisites

* Python 3.10 or above
* Google Chrome (**currently supported**)
* [uv](https://docs.astral.sh/uv/) package manager

## Environments

### Install uv

If you haven't installed uv yet, please refer to the [official installation guide](https://docs.astral.sh/uv/getting-started/installation/).

### Create Python Virtual Environment and Install Dependencies

* macOS/Linux/Windows

```bash
uv sync
```

This command will automatically create a virtual environment and install all dependencies specified in `pyproject.toml`.

## How to use

### Arguments

| Args name    | Type   | Default  | Description                  |
|--------------|--------|----------|------------------------------|
| `--url`      | `str`  | `None`   | Naver Blog URL               |
| `--output`   | `str`  | `images` | Image output directory       |
| `--headless` | `bool` | `True`   | Whether to use headless mode |

### Example

#### Normal mode (will open a browser window)

```bash
uv run naver_blog_image_downloader.py \
  --url https://blog.naver.com/edament/223882152167 \
  --output images
```

#### Headless mode (will not open a browser window)

```bash
uv run naver_blog_image_downloader.py \
  --url https://blog.naver.com/edament/223882152167 \
  --output images \
  --headless
```

## Current Limitations

* Uses Selenium as the only method for downloading images
* Only uses a single thread for downloading images

## Current Issues

* Sometimes the downloaded images may have incorrect ordering
