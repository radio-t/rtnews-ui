FROM node:11-alpine AS deps
COPY ./package.json ./package-lock.json /app/
RUN \
	cd /app && \
	npm ci --loglevel error


FROM node:11-alpine as base
RUN apk add --update --no-cache make


FROM base
COPY --from=deps /app /app
EXPOSE 9000
WORKDIR /app
ENTRYPOINT ["/bin/ash"]
