# Note: addUserData() automatically adds shebang at the start of the file.
mkfs -t xfs /dev/nvme1n1
mkdir /data
mount /dev/nvme1n1 /data
chmod 770 /data

echo -e "[mongodb-org-5.0] \nname=MongoDB Repository\nbaseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/\ngpgcheck=1 \nenabled=1 \ngpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc" | sudo tee /etc/yum.repos.d/mongodb-org-5.0.repo

sudo rpm --import https://www.mongodb.org/static/pgp/server-6.0.asc

cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

yum update
yum install -y mongodb-database-tools htop python3-pip python3-wheel jq bash tmux nohup mongodb-org-shell
amazon-linux-extras install redis6 postgresql14

wget -O /usr/bin/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem