# Naver Blog Image Downloader

## Prerequisites

* Python 3.10 or above
* Google Chrome (**currently supported**)

## Environments

### Create Python Virtual Environment

* macOS/Linux

```bash
python3.10 -m venv .venv
```

* Windows

```bash
python -m venv .venv
```

### Activate Python Virtual Environment

* macOS/Linux

```bash
source .venv/bin/activate
```

* Windows

```bash
.venv\Scripts\activate
```

### Install Python Dependencies

* macOS/Linux/Windows

```bash
pip install -r requirements.txt
```

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
python naver_blog_image_downloader.py \
  --url https://blog.naver.com/edament/223882152167 \
  --output images
```

#### Headless mode (will not open a browser window)

```bash
python naver_blog_image_downloader.py \
  --url https://blog.naver.com/edament/223882152167 \
  --output images \
  --headless
```

## Current Limitations

* Only uses Selenium to download images
* Only single thread to download images

## Current Issues

* Sometimes the downloaded images may have incorrect ordering
