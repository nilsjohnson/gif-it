#!/bin/bash
echo "sending package.json..."
scp -i "/home/nils/.ssh/gif-it.pem" -r /home/nils/gif-it/package.json ubuntu@ec2-54-90-40-59.compute-1.amazonaws.com:~
