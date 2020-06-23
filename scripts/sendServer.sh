echo "Transferring Server Directory..."
scp -i "/home/nils/.ssh/gif-it.pem" -r /home/nils/gif-it/server ubuntu@ec2-54-90-40-59.compute-1.amazonaws.com:~

