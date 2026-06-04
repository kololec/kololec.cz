PORT ?= 8080
NODE ?= node

.PHONY: help preview preview-url

help:
	@printf '%s\n' 'Available targets:'
	@printf '  %-12s %s\n' 'preview' 'Serve the static site locally with live reload'
	@printf '  %-12s %s\n' 'preview-url' 'Print the local preview URL'
	@printf '\n%s\n' 'Examples:'
	@printf '  %s\n' 'make preview'
	@printf '  %s\n' 'make preview PORT=3000'

preview:
	@PORT=$(PORT) $(NODE) scripts/preview.mjs

preview-url:
	@printf 'http://localhost:%s\n' '$(PORT)'
