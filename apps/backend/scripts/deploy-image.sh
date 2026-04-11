#!/bin/bash

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

# Validate container image configuration

echo "Validating container image configuration..."

if [ -z "$IMAGE_NAME" ] || [ "$IMAGE_NAME" = "" ]; then
    echo "Error: IMAGE_NAME is empty or not set"
    exit 1
fi

if [ -z "$IMAGE_TAG" ] || [ "$IMAGE_TAG" = "" ]; then
    echo "Error: IMAGE_TAG is empty or not set"
    exit 1
fi

if [ -z "$IMAGE_ARCH" ] || [ "$IMAGE_ARCH" = "" ]; then
    echo "Error: IMAGE_ARCH is empty or not set"
    exit 1
fi

if [ -z "$DOCKERFILE_PATH" ] || [ "$DOCKERFILE_PATH" = "" ]; then
    echo "Error: DOCKERFILE_PATH is empty or not set"
    exit 1
fi

echo "Container image configuration validated successfully."

# Build the Docker image for the Naver Blog Image Downloader Lambda function

echo "Building Docker image..."
echo "IMAGE_NAME: $IMAGE_NAME"
echo "IMAGE_TAG: $IMAGE_TAG"
echo "IMAGE_ARCH: $IMAGE_ARCH"
echo "DOCKERFILE_PATH: $DOCKERFILE_PATH"

docker build --no-cache --platform $IMAGE_ARCH -t $IMAGE_NAME:$IMAGE_TAG -f $DOCKERFILE_PATH .

if [ $? -ne 0 ]; then
    echo "Error: Failed to build Docker image"
    exit 1
fi

echo "Docker image built successfully."

# Login to AWS ECR

echo "Validating AWS credentials..."

# 從環境變數讀取並檢查是否為空值
if [ -z "$AWS_REGION" ] || [ "$AWS_REGION" = "" ]; then
    echo "Error: AWS_REGION is empty or not set"
    exit 1
fi

if [ -z "$AWS_ECR_REPOSITORY_URI" ] || [ "$AWS_ECR_REPOSITORY_URI" = "" ]; then
    echo "Error: AWS_ECR_REPOSITORY_URI is empty or not set"
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

echo "AWS credentials validated successfully."
echo "Configuring AWS CLI..."

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region $AWS_REGION

echo "Logging in to AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ECR_REPOSITORY_URI

if [ $? -eq 0 ]; then
    echo "Successfully logged in to AWS ECR."
else
    echo "Error: Failed to login to AWS ECR"
    exit 1
fi

# Upload the Docker image to AWS ECR

echo "Tagging Docker image..."
docker tag $IMAGE_NAME:$IMAGE_TAG $AWS_ECR_REPOSITORY_URI/$IMAGE_NAME:$IMAGE_TAG

if [ $? -eq 0 ]; then
    echo "Successfully tagged Docker image."
else
    echo "Error: Failed to tag Docker image"
    exit 1
fi

echo "Pushing Docker image to ECR..."
docker push $AWS_ECR_REPOSITORY_URI/$IMAGE_NAME:$IMAGE_TAG

if [ $? -eq 0 ]; then
    echo "Docker image pushed to ECR: $AWS_ECR_REPOSITORY_URI/$IMAGE_NAME:$IMAGE_TAG"
else
    echo "Error: Failed to push Docker image to ECR"
    exit 1
fi

# Clean up local Docker images

echo "Cleaning up local Docker images..."
docker rmi $AWS_ECR_REPOSITORY_URI/$IMAGE_NAME:$IMAGE_TAG
docker rmi $IMAGE_NAME:$IMAGE_TAG

echo "Local Docker images cleaned up."
echo "Deployment completed successfully!"