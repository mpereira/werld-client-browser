PARSED_PACKAGE_JSON        := JSON.parse(require('fs').readFileSync('package.json', 'utf8'))

PROJECT_NAME               := $(shell node -e "console.log($(PARSED_PACKAGE_JSON).name)")
PROJECT_VERSION            := $(shell node -e "console.log($(PARSED_PACKAGE_JSON).version)")
PROJECT_GIT_REPOSITORY_URL := $(shell node -e "console.log($(PARSED_PACKAGE_JSON).repository.url)")

GRUNT                      := node_modules/grunt/bin/grunt

ifneq ($(NODE_ENV),production)
NODE_ENV                   := development
endif

.PHONY: update_node_modules build distclean server watch

PLEASE_INSTALL_NPM_MESSAGE := Please install npm. Instructions here: http://npmjs.org/

ifeq ($(shell which npm),)
node_modules:
	@echo $(PLEASE_INSTALL_NPM_MESSAGE)
else
node_modules:
	@npm install
endif

ifeq ($(shell which npm),)
update_node_modules:
	@echo $(PLEASE_INSTALL_NPM_MESSAGE)
else
update_node_modules:
	@rm -rf node_modules
	@make node_modules
endif

build: node_modules
	@echo [$(PROJECT_NAME)] Compiling $(NODE_ENV) assets...
	@NODE_ENV=$(NODE_ENV) $(GRUNT) build --force 2>> $(PROJECT_NAME)-debug.log 1> /dev/null

distclean:
	@rm -rf build/*

server: build
	@NODE_ENV=$(NODE_ENV) npm start

watch: build
	@NODE_ENV=$(NODE_ENV) $(GRUNT) --force watch
