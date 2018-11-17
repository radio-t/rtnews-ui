.PHONY: build
build:
	./node_modules/.bin/webpack --mode production

.PHONY: buildDev
buildDev:
	./node_modules/.bin/webpack --mode development

.PHONY: watch
watch:
	./node_modules/.bin/webpack --watch --mode production

# binds to 0.0.0.0:9000
.PHONY: server
server:
	python3 server.py

# binds to 127.0.0.1:9000
.PHONY: devServer
devServer:
	./node_modules/.bin/webpack-dev-server --mode development

# binds to 0.0.0.0:9000
.PHONY: devServerWithRemote
devServerWithRemote:
	./node_modules/.bin/webpack-dev-server --mode development --remote


#docker

.PHONY: dockerBuild
dockerBuild:
	docker-compose build

# usefull after changing dependencies in package.json
.PHONY: dockerClear
dockerClear:
	docker-compose down --rmi all

# usefull when want to test/add/remove new dependencies
.PHONY: dockerShell
dockerShell:
	docker-compose run --rm -p "127.0.0.1:9000:9000" builder

# builds "public" directory
.PHONY: dockerBuildPublic
dockerBuildPublic:
	docker-compose run --rm builder -c "make build"

# binds to 127.0.0.1:9000
.PHONY: dockerDevServer
dockerDevServer:
	docker-compose run --rm -p "127.0.0.1:9000:9000" builder -c "make devServerWithRemote"

# binds to 0.0.0.0:9000
.PHONY: dockerDevServerWithRemote
dockerDevServerWithRemote:
	docker-compose run --rm -p "0.0.0.0:9000:9000" builder -c "make devServerWithRemote"