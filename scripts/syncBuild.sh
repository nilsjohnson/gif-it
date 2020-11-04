#!/bin/bash
echo "syncing build directory..."

#Be Very Careful Here....We really dont want to delete all our gifs by mistake.
aws s3 rm --recursive s3://gif-it.io --exclude "*.gif" --exclude "*.jpg" --exclude "*.jpeg" --exclude "*.mp4"
aws s3 sync ~/gif-it/build/ s3://gif-it.io


