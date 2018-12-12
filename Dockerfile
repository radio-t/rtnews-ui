FROM node:10-alpine AS build
COPY ./package.json ./package-lock.json ./webpack.config.js ./tsconfig.json /app/
COPY ./@types /app/@types
COPY ./src /app/src
RUN \
	cd /app && \
	npm ci --loglevel error && \
	./node_modules/.bin/webpack --mode production && \
	rm -rf ./node_modules /root/.npm /root/.config /tmp/*


FROM alpine
COPY --from=build /app/public /var/www/webapp
VOLUME ["/var/www/webapp"]
CMD ["-c", "tail -f /dev/null"]
ENTRYPOINT ["/bin/sh"]
