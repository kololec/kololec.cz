PORT ?= 8080

.PHONY: help preview preview-url build

help:
	@printf '%s\n' 'Available targets:'
	@printf '  %-12s %s\n' 'preview' 'Serve the Astro site locally with live reload'
	@printf '  %-12s %s\n' 'build' 'Build the static site into dist/'
	@printf '  %-12s %s\n' 'preview-url' 'Print the local preview URL'
	@printf '\n%s\n' 'Examples:'
	@printf '  %s\n' 'make preview'
	@printf '  %s\n' 'make preview PORT=3000'

preview:
	@npm run dev -- --host 127.0.0.1 --port $(PORT)

build:
	@npm run build

preview-url:
	@printf 'http://localhost:%s\n' '$(PORT)'
