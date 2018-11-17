FROM node:10-alpine AS rtnews_frontend_build
COPY ./ /app/
RUN \
	cd /app && \
	npm ci --loglevel error && \
	./node_modules/.bin/webpack --mode production


FROM node:10-alpine
COPY --from=rtnews_frontend_build /app/public /var/www/webapp
VOLUME ["/var/www/webapp"]
CMD ["-c", "tail -f /dev/null"]
ENTRYPOINT ["/bin/sh"]
