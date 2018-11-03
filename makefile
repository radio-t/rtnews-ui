.PHONY: build
build:
	./node_modules/.bin/webpack --mode production

.PHONY: buildDev
buildDev:
	./node_modules/.bin/webpack --mode development

.PHONY: watch
watch:
	./node_modules/.bin/webpack --watch --mode production

.PHONY: server
server:
	python3 server.py

.PHONY: devServer
devServer:
	./node_modules/.bin/webpack-dev-server --mode development

.PHONY: devServerWithRemote
devServerWithRemote:
	./node_modules/.bin/webpack-dev-server --mode development --remote