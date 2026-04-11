#!/bin/bash

# 一次性執行：建立 S3 Bucket、設定 IAM 權限、更新 Lambda 配置
# 用途：部署非同步 + Polling 架構所需的 AWS 資源

# 載入環境變數
echo "載入環境變數..."

if [ ! -f ".env" ]; then
    echo "Error: .env file not found in current directory"
    exit 1
fi

set -a
source .env
set +a

echo "環境變數載入完成。"

# 驗證必要變數
if [ -z "$AWS_REGION" ] || [ "$AWS_REGION" = "" ]; then
    echo "Error: AWS_REGION is empty or not set"
    exit 1
fi

if [ -z "$AWS_LAMBDA_FUNCTION_NAME" ] || [ "$AWS_LAMBDA_FUNCTION_NAME" = "" ]; then
    echo "Error: AWS_LAMBDA_FUNCTION_NAME is empty or not set"
    exit 1
fi

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ "$AWS_ACCESS_KEY_ID" = "" ]; then
    echo "Error: AWS_ACCESS_KEY_ID is empty or not set"
    exit 1
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ "$AWS_SECRET_ACCESS_KEY" = "" ]; then
    echo "Error: AWS_SECRET_ACCESS_KEY is empty or not set"
    exit 1
fi

S3_BUCKET_NAME="${S3_BUCKET_NAME:-naver-blog-download-jobs}"

echo "設定 AWS CLI..."
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region $AWS_REGION

# ===== 1. 建立 S3 Bucket =====
echo ""
echo "===== 建立 S3 Bucket: $S3_BUCKET_NAME ====="

aws s3api create-bucket \
    --bucket $S3_BUCKET_NAME \
    --region $AWS_REGION \
    --create-bucket-configuration LocationConstraint=$AWS_REGION \
    --no-cli-pager 2>/dev/null

if [ $? -eq 0 ]; then
    echo "S3 Bucket 建立成功。"
else
    echo "S3 Bucket 可能已存在，繼續執行..."
fi

# ===== 2. 設定 Lifecycle Rule =====
echo ""
echo "===== 設定 S3 Lifecycle Rule（jobs/ 下物件 1 天後自動刪除）====="

aws s3api put-bucket-lifecycle-configuration \
    --bucket $S3_BUCKET_NAME \
    --lifecycle-configuration '{
        "Rules": [{
            "ID": "expire-jobs",
            "Filter": {"Prefix": "jobs/"},
            "Status": "Enabled",
            "Expiration": {"Days": 1}
        }]
    }' \
    --no-cli-pager

if [ $? -eq 0 ]; then
    echo "Lifecycle Rule 設定成功。"
else
    echo "Error: Lifecycle Rule 設定失敗"
    exit 1
fi

# ===== 3. 取得 Lambda 執行角色 =====
echo ""
echo "===== 取得 Lambda 執行角色 ====="

ROLE_ARN=$(aws lambda get-function \
    --function-name $AWS_LAMBDA_FUNCTION_NAME \
    --query 'Configuration.Role' \
    --output text \
    --no-cli-pager)

if [ -z "$ROLE_ARN" ] || [ "$ROLE_ARN" = "None" ]; then
    echo "Error: 無法取得 Lambda 執行角色"
    exit 1
fi

ROLE_NAME=$(echo $ROLE_ARN | sed 's|.*/||')
echo "角色: $ROLE_NAME ($ROLE_ARN)"

# ===== 4. 取得 Lambda 函數 ARN =====
FUNCTION_ARN=$(aws lambda get-function \
    --function-name $AWS_LAMBDA_FUNCTION_NAME \
    --query 'Configuration.FunctionArn' \
    --output text \
    --no-cli-pager)

echo "函數 ARN: $FUNCTION_ARN"

# ===== 5. 建立並附加 IAM Policy =====
echo ""
echo "===== 建立 IAM Policy ====="

POLICY_NAME="naver-blog-downloader-async-policy"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --no-cli-pager)

POLICY_DOC=$(cat <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3JobStorage",
            "Effect": "Allow",
            "Action": ["s3:PutObject", "s3:GetObject"],
            "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/jobs/*"
        },
        {
            "Sid": "S3WhatsNewReadWrite",
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:PutObject"],
            "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/whatsnew/*"
        },
        {
            "Sid": "S3WhatsNewList",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}",
            "Condition": {
                "StringLike": {
                    "s3:prefix": "whatsnew/*"
                }
            }
        },
        {
            "Sid": "LambdaSelfInvoke",
            "Effect": "Allow",
            "Action": "lambda:InvokeFunction",
            "Resource": "${FUNCTION_ARN}"
        }
    ]
}
EOF
)

# 嘗試建立 Policy（如果已存在則取得 ARN）
POLICY_ARN=$(aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document "$POLICY_DOC" \
    --query 'Policy.Arn' \
    --output text \
    --no-cli-pager 2>/dev/null)

if [ -z "$POLICY_ARN" ] || [ "$POLICY_ARN" = "None" ]; then
    POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"
    echo "Policy 可能已存在，使用 ARN: $POLICY_ARN"

    # 刪除最舊的非預設版本，避免超過 5 版上限
    OLDEST_VERSION=$(aws iam list-policy-versions \
        --policy-arn $POLICY_ARN \
        --query 'Versions[?IsDefaultVersion==`false`] | [-1].VersionId' \
        --output text \
        --no-cli-pager 2>/dev/null)
    if [ -n "$OLDEST_VERSION" ] && [ "$OLDEST_VERSION" != "None" ]; then
        echo "刪除舊版本 ${OLDEST_VERSION}..."
        aws iam delete-policy-version \
            --policy-arn $POLICY_ARN \
            --version-id $OLDEST_VERSION \
            --no-cli-pager
    fi

    # 更新現有 Policy
    echo "更新現有 Policy..."
    aws iam create-policy-version \
        --policy-arn $POLICY_ARN \
        --policy-document "$POLICY_DOC" \
        --set-as-default \
        --no-cli-pager
else
    echo "Policy 建立成功: $POLICY_ARN"
fi

echo "附加 Policy 到角色 $ROLE_NAME ..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn $POLICY_ARN \
    --no-cli-pager

if [ $? -eq 0 ]; then
    echo "Policy 附加成功。"
else
    echo "Error: Policy 附加失敗"
    exit 1
fi

# ===== 6. 更新 Lambda 配置 =====
echo ""
echo "===== 更新 Lambda 配置（記憶體、超時、環境變數）====="

# 取得現有環境變數並合併 S3_BUCKET_NAME
EXISTING_ENV=$(aws lambda get-function-configuration \
    --function-name $AWS_LAMBDA_FUNCTION_NAME \
    --query 'Environment.Variables' \
    --output json \
    --no-cli-pager 2>/dev/null || echo '{}')

NEW_ENV=$(echo "$EXISTING_ENV" | python3 -c "
import sys, json
env = json.load(sys.stdin) or {}
env['S3_BUCKET_NAME'] = '${S3_BUCKET_NAME}'
print(json.dumps({'Variables': env}))
")

echo "更新 Lambda 配置..."
echo "  記憶體: 2048 MB"
echo "  超時: 120 秒"
echo "  S3_BUCKET_NAME: $S3_BUCKET_NAME"

aws lambda update-function-configuration \
    --function-name $AWS_LAMBDA_FUNCTION_NAME \
    --memory-size 2048 \
    --timeout 120 \
    --environment "$NEW_ENV" \
    --no-cli-pager \
    --output json \
    --query '{FunctionName: FunctionName, MemorySize: MemorySize, Timeout: Timeout, LastUpdateStatus: LastUpdateStatus}' > /dev/null

if [ $? -eq 0 ]; then
    echo "Lambda 配置更新已發起，等待完成..."

    aws lambda wait function-updated \
        --function-name $AWS_LAMBDA_FUNCTION_NAME \
        --no-cli-pager

    if [ $? -eq 0 ]; then
        echo "Lambda 配置更新完成。"

        # 驗證最終配置
        echo ""
        echo "===== 最終 Lambda 配置 ====="
        aws lambda get-function-configuration \
            --function-name $AWS_LAMBDA_FUNCTION_NAME \
            --no-cli-pager \
            --output table \
            --query '{FunctionName: FunctionName, MemorySize: MemorySize, Timeout: Timeout, State: State, LastUpdateStatus: LastUpdateStatus}'
    else
        echo "Error: Lambda 配置更新逾時"
        exit 1
    fi
else
    echo "Error: Lambda 配置更新失敗"
    exit 1
fi

echo ""
echo "✅ AWS 資源設定完成！"
echo ""
echo "已完成的設定："
echo "  - S3 Bucket: $S3_BUCKET_NAME（含 1 天自動清理 Lifecycle Rule）"
echo "  - IAM Policy: $POLICY_NAME（S3 + Lambda 自我呼叫權限）"
echo "  - Lambda 配置: 2048MB 記憶體 / 120 秒超時 / S3_BUCKET_NAME 環境變數"
