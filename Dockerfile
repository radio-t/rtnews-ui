FROM node:10-alpine AS rtnews_deps

COPY ./package.json ./package-lock.json /app/

RUN \
	cd /app && \
	npm i --loglevel error


FROM node:10-alpine

COPY --from=rtnews_deps /app /app

RUN \
	cd /app && \
	apk add --update make && \
	npm i --loglevel error

EXPOSE 9000

WORKDIR /app
ENTRYPOINT ["/bin/ash"]