#!/usr/bin/env python3
"""管理 S3 上的 whatsNew JSON 檔案：上傳、列出

用法：
  uv run --with boto3 scripts/manage_whats_new.py upload -v 1.5.0 -l zh-TW -f mock/mock_whats_new_zh-TW.json
  uv run --with boto3 scripts/manage_whats_new.py upload -v 1.5.0 -d mock/
  uv run --with boto3 scripts/manage_whats_new.py list
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

# 將 src/ 加入 import 路徑，使 job_store 等模組可直接匯入
_project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_project_root / "src"))

# 從 .env 載入環境變數（不依賴 python-dotenv）
_env_file = _project_root / ".env"
if _env_file.exists():
    for line in _env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())


def validate_whats_new_json(data: dict) -> list[str]:
    """驗證 whatsNew JSON 結構，回傳錯誤訊息列表（空 = 通過）"""
    errors = []

    # 檢查必要的頂層欄位
    for key in ("version", "onboarding", "whatsNew"):
        if key not in data:
            errors.append(f"缺少頂層欄位: {key}")

    # 檢查 version 格式
    if "version" in data and not re.match(r"^\d+\.\d+\.\d+$", str(data["version"])):
        errors.append(f"version 格式不正確: {data['version']}（應為 x.y.z）")

    # 檢查 onboarding / whatsNew 各項目
    for section in ("onboarding", "whatsNew"):
        items = data.get(section, [])
        if not isinstance(items, list):
            errors.append(f"{section} 應為陣列")
            continue
        for i, item in enumerate(items):
            for field in ("type", "title", "description"):
                if field not in item:
                    errors.append(f"{section}[{i}] 缺少欄位: {field}")
            item_type = item.get("type")
            if item_type == "text" and "icon" not in item:
                errors.append(f"{section}[{i}] type=text 但缺少 icon 欄位")
            elif item_type == "image" and "base64Image" not in item:
                errors.append(f"{section}[{i}] type=image 但缺少 base64Image 欄位")

    return errors


# --- 子命令實作 ---


def cmd_upload(args):
    """上傳 whatsNew JSON 至 S3"""
    from job_store import WhatsNewStore

    files_to_upload: list[tuple[str, str, dict]] = []  # (version, locale, data)

    if args.file:
        # 單檔上傳模式
        if not args.version or not args.locale:
            print("錯誤: 單檔上傳需指定 --version 與 --locale")
            sys.exit(1)
        data = json.loads(Path(args.file).read_text(encoding="utf-8"))
        files_to_upload.append((args.version, args.locale, data))
    elif args.dir:
        # 批次上傳模式：從目錄自動偵測語系
        if not args.version:
            print("錯誤: 批次上傳需指定 --version")
            sys.exit(1)
        dir_path = Path(args.dir)
        pattern = re.compile(r"(?:mock_)?whats_new_(.+)\.json")
        for f in sorted(dir_path.glob("*whats_new_*.json")):
            m = pattern.match(f.name)
            if m:
                locale = m.group(1)
                data = json.loads(f.read_text(encoding="utf-8"))
                files_to_upload.append((args.version, locale, data))
        if not files_to_upload:
            print(f"錯誤: 在 {args.dir} 中找不到 whats_new_*.json 檔案")
            sys.exit(1)
    else:
        print("錯誤: 需指定 --file 或 --dir")
        sys.exit(1)

    # 驗證全部檔案
    has_error = False
    for version, locale, data in files_to_upload:
        errors = validate_whats_new_json(data)
        if errors:
            print(f"[驗證失敗] {version}/{locale}:")
            for e in errors:
                print(f"  - {e}")
            has_error = True
    if has_error:
        print("\n驗證未通過，中止上傳。")
        sys.exit(1)

    # Dry-run 模式
    if args.dry_run:
        store = WhatsNewStore()
        print("[Dry-run] 以下檔案將被上傳（不實際寫入 S3）：")
        for version, locale, _data in files_to_upload:
            key = store._build_key(f"{version}/{locale}")
            print(f"  - s3://{store._bucket}/{key}")
        return

    # 上傳
    store = WhatsNewStore()
    for version, locale, data in files_to_upload:
        s3_key = store.put_whats_new(version, locale, data)
        print(f"[上傳成功] s3://{store._bucket}/{s3_key}")


def cmd_list(args):
    """列出 S3 上的 whatsnew 檔案"""
    from job_store import WhatsNewStore

    store = WhatsNewStore()
    prefix = args.version or ""
    keys = store.list_versions(prefix)
    if not keys:
        print("S3 上沒有找到任何 whatsnew 檔案。")
        return
    print(f"找到 {len(keys)} 個檔案：")
    for key in keys:
        print(f"  - {key}")


# --- 主程式 ---


def main():
    parser = argparse.ArgumentParser(description="管理 S3 上的 whatsNew JSON 檔案")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # upload 子命令
    p_upload = subparsers.add_parser("upload", help="上傳 whatsNew JSON 至 S3")
    p_upload.add_argument("--version", "-v", help="App 版號（如 1.5.0）")
    p_upload.add_argument("--locale", "-l", help="語系（如 zh-TW、en、ja、ko）")
    p_upload.add_argument("--file", "-f", help="JSON 檔案路徑")
    p_upload.add_argument("--dir", "-d", help="批次上傳：包含 whats_new_*.json 的目錄")
    p_upload.add_argument("--dry-run", action="store_true", help="僅顯示將執行的操作，不實際上傳")
    p_upload.set_defaults(func=cmd_upload)

    # list 子命令
    p_list = subparsers.add_parser("list", help="列出 S3 上的 whatsnew 檔案")
    p_list.add_argument("--version", "-v", help="依版號篩選")
    p_list.set_defaults(func=cmd_list)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
