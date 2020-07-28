#!/bin/bash
echo "syncing build directory..."

aws s3 sync ~/gif-it/build/ s3://gif-it.io


