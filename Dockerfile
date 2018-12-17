FROM node:11-alpine AS build
COPY ./package.json ./package-lock.json ./webpack.config.js ./tsconfig.json ./jest.config.js /app/
COPY ./@types /app/@types
COPY ./testSetup /app/testSetup
COPY ./src /app/src
RUN \
	cd /app && \
	npm ci --loglevel error && \
	./node_modules/.bin/jest && \
	./node_modules/.bin/webpack --mode production && \
	rm -rf ./node_modules /root/.npm /root/.config /tmp/*


FROM alpine
COPY --from=build /app/public /var/www/webapp
VOLUME ["/var/www/webapp"]
CMD ["-c", "tail -f /dev/null"]
ENTRYPOINT ["/bin/sh"]
