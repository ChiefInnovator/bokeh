# Bokeh — agent rules

- Branch flow: `feature/*` → PR into `develop` → PR into `main`. Never commit directly to `main` or `develop`.
- `main` only accepts PRs from `develop`; `develop` only accepts PRs from `feature/*` (enforced by the `branch-policy` workflow + repo rulesets).
- Copilot code review runs automatically on PRs into `develop` only.
- GitHub Pages serves `main` at https://chiefinnovator.github.io/bokeh/.
