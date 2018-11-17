FROM node:10-alpine AS rtnews_deps
COPY ./package.json ./package-lock.json /app/
RUN \
	cd /app && \
	npm ci --loglevel error


FROM node:10-alpine as rtnews_base
RUN apk add --update --no-cache make


FROM rtnews_base
COPY --from=rtnews_deps /app /app
VOLUME /app/public
EXPOSE 9000
WORKDIR /app
ENTRYPOINT ["/bin/ash"]
