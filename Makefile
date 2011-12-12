USER       = ec2-user
SSH        = ssh
RSYNC      = rsync
DIRECTORY  = /var/www/www.werldonline.com/
DEPLOY_KEY = $(HOME)/Dropbox/ego/aws/murilo.pem
HOST       = ec2-50-16-8-218.compute-1.amazonaws.com

deploy:
	$(RSYNC) -Chrtz --exclude Makefile --progress -e '$(SSH) -i $(DEPLOY_KEY)' * $(USER)@$(HOST):$(DIRECTORY)
