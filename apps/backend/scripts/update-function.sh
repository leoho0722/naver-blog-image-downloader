#!/bin/bash

# Update the Lambda function with the new Docker image

# Load environment variables from .env file

echo "Loading environment variables from .env file..."

if [ ! -f ".env" ]; then
    echo "Error: .env file not found in current directory"
    exit 1
fi

set -a
source .env
set +a

echo "Environment variables loaded successfully."

# Validate Lambda function configuration

echo "Validating Lambda function configuration..."

if [ -z "$AWS_LAMBDA_FUNCTION_NAME" ] || [ "$AWS_LAMBDA_FUNCTION_NAME" = "" ]; then
    echo "Error: AWS_LAMBDA_FUNCTION_NAME is empty or not set"
    exit 1
fi

if [ -z "$AWS_ECR_REPOSITORY_URI" ] || [ "$AWS_ECR_REPOSITORY_URI" = "" ]; then
    echo "Error: AWS_ECR_REPOSITORY_URI is empty or not set"
    exit 1
fi

if [ -z "$IMAGE_NAME" ] || [ "$IMAGE_NAME" = "" ]; then
    echo "Error: IMAGE_NAME is empty or not set"
    exit 1
fi

if [ -z "$IMAGE_TAG" ] || [ "$IMAGE_TAG" = "" ]; then
    echo "Error: IMAGE_TAG is empty or not set"
    exit 1
fi

if [ -z "$AWS_REGION" ] || [ "$AWS_REGION" = "" ]; then
    echo "Error: AWS_REGION is empty or not set"
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

echo "Lambda function configuration validated successfully."

# Set IMAGE_URI
IMAGE_URI=$AWS_ECR_REPOSITORY_URI/$IMAGE_NAME:$IMAGE_TAG

echo "Configuring AWS CLI..."
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region $AWS_REGION

echo "Updating Lambda function..."
echo "FUNCTION_NAME: $AWS_LAMBDA_FUNCTION_NAME"
echo "AWS_ECR_REPOSITORY_URI: $AWS_ECR_REPOSITORY_URI"
echo "IMAGE_NAME: $IMAGE_NAME"
echo "IMAGE_TAG: $IMAGE_TAG"
echo "IMAGE_URI: $IMAGE_URI"

# 更新 Lambda 函數
echo "Updating Lambda function code..."
aws lambda update-function-code \
    --function-name $AWS_LAMBDA_FUNCTION_NAME \
    --image-uri $IMAGE_URI \
    --no-cli-pager \
    --output json \
    --query '{FunctionName: FunctionName, LastUpdateStatus: LastUpdateStatus, CodeSize: CodeSize}' > /tmp/lambda-update-result.json

if [ $? -eq 0 ]; then
    echo "Lambda function code update initiated. Waiting for update to complete..."
    
    # 等待函數更新完成
    aws lambda wait function-updated \
        --function-name $AWS_LAMBDA_FUNCTION_NAME \
        --no-cli-pager
    
    if [ $? -eq 0 ]; then
        echo "Lambda function update completed."

        # 更新 Lambda 配置（記憶體、超時、環境變數）
        echo "Updating Lambda function configuration..."

        S3_BUCKET_NAME="${S3_BUCKET_NAME:-naver-blog-download-jobs}"

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

        aws lambda update-function-configuration \
            --function-name $AWS_LAMBDA_FUNCTION_NAME \
            --memory-size 2048 \
            --timeout 120 \
            --environment "$NEW_ENV" \
            --no-cli-pager \
            --output json > /dev/null

        if [ $? -eq 0 ]; then
            echo "Lambda configuration update initiated. Waiting for update to complete..."
            aws lambda wait function-updated \
                --function-name $AWS_LAMBDA_FUNCTION_NAME \
                --no-cli-pager
        else
            echo "Warning: Failed to update Lambda configuration"
        fi

        echo "Verifying final status..."

        # 只顯示關鍵資訊
        aws lambda get-function \
            --function-name $AWS_LAMBDA_FUNCTION_NAME \
            --no-cli-pager \
            --output table \
            --query 'Configuration.{FunctionName: FunctionName, Runtime: PackageType, MemorySize: MemorySize, Timeout: Timeout, CodeSize: CodeSize, LastModified: LastModified, State: State, LastUpdateStatus: LastUpdateStatus}'

        echo "Successfully updated Lambda function."
    else
        echo "Error: Lambda function update timed out or failed"
        exit 1
    fi
else
    echo "Error: Failed to update Lambda function"
    exit 1
fi