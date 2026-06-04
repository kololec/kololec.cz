PORT ?= 8080
PYTHON ?= python3

.PHONY: help preview preview-url

help:
	@printf '%s\n' 'Available targets:'
	@printf '  %-12s %s\n' 'preview' 'Serve the static site locally'
	@printf '  %-12s %s\n' 'preview-url' 'Print the local preview URL'
	@printf '\n%s\n' 'Examples:'
	@printf '  %s\n' 'make preview'
	@printf '  %s\n' 'make preview PORT=3000'

preview:
	@printf 'Serving Kololeč preview at http://localhost:%s\n' '$(PORT)'
	@printf 'Press Ctrl+C to stop.\n'
	@$(PYTHON) -m http.server $(PORT)

preview-url:
	@printf 'http://localhost:%s\n' '$(PORT)'
