FROM node:10-alpine AS rtnews_frontend_build_deps
COPY ./package.json ./package-lock.json /app/
RUN \
	cd /app && \
	npm ci --loglevel error


FROM node:10-alpine AS rtnews_frontend_build
COPY --from=rtnews_frontend_build_deps /app /app
COPY ./webpack.config.js /app/
COPY ./src /app/src
RUN \
	cd /app && \
	./node_modules/.bin/webpack --mode production


FROM node:10-alpine
COPY --from=rtnews_frontend_build /app/public /var/www/webapp
VOLUME ["/var/www/webapp"]
CMD ["-c", "tail -f /dev/null"]
ENTRYPOINT ["/bin/sh"]
