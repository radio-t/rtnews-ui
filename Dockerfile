FROM node:4.2.3

ENV DISQUS=test \
    APIPATH=/api

ADD . /srv/rtnews-ui

RUN \
	cd /srv/rtnews-ui && \
	npm i -g gulp && \
	npm i && \
	gulp build && \
	mkdir -p /var/www && \
	mv ./public /var/www/webapp && \
	mv /srv/rtnews-ui/dockerinit.sh /init.sh && \
	chmod +x /init.sh	

ENTRYPOINT ["/init.sh"]

CMD ["sleep", "100"]
