FROM node:10-alpine AS rtnews_frontend_build
COPY ./package.json ./package-lock.json ./webpack.config.js /app/
COPY ./src /app/src
RUN \
	cd /app && \
	npm ci --loglevel error && \
	./node_modules/.bin/webpack --mode production && \
	rm -rf ./node_modules /root/.npm /root/.config /tmp/*


FROM alpine
COPY --from=rtnews_frontend_build /app/public /var/www/webapp
VOLUME ["/var/www/webapp"]
CMD ["-c", "tail -f /dev/null"]
ENTRYPOINT ["/bin/sh"]
