node dist/src/cli.js assess examples/services.json > /tmp/s.md; diff /tmp/s.md docs/sample-review.md
test "$(node dist/src/cli.js assess examples/services.json --fail-below-required >/dev/null; echo $?)" = "1"
