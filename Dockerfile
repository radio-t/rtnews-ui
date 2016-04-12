FROM node:4.2.3

ENV DISQUS=test \
    APIPATH=/api

ADD . /srv/rtnews-ui

RUN \
	cd /srv/rtnews-ui && \
	npm i -g gulpjs/gulp#4.0 && \
	npm i && \
	npm run build && \
	mkdir -p /var/www && \
	mv ./public /var/www/webapp && \
	mv /srv/rtnews-ui/dockerinit.sh /init.sh && \
	chmod +x /init.sh	

VOLUME ["/var/www/webapp"]

ENTRYPOINT ["/init.sh"]

CMD ["sleep", "100"]
