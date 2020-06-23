echo "Transferring Node Modules..."
scp -i "/home/nils/.ssh/gif-it.pem" -r /home/nils/gif-it/node_modules ubuntu@ec2-54-196-47-98.compute-1.amazonaws.com:~

