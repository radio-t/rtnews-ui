FROM node:4.2.3

ADD . /srv/rtnews-ui

RUN \
	cd /srv/rtnews-ui && \
	npm i && \
	make build && \
	mkdir -p /var/www && \
	mv ./public /var/www/webapp && \
	mv /srv/rtnews-ui/dockerinit.sh /init.sh && \
	chmod +x /init.sh

VOLUME ["/var/www/webapp"]

ENTRYPOINT ["/init.sh"]

CMD ["sleep", "100"]
