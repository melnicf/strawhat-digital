# Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Examples

```bash
feat: add navbar component
feat(navbar): add mobile menu toggle
fix: correct tailwind class ordering
docs: update README with setup instructions
style: format code with prettier
refactor: simplify navbar component structure
perf: optimize image loading
test: add navbar component tests
chore: update dependencies
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc)
- **revert**: Revert a previous commit
- **ci**: CI/CD changes
- **build**: Build system or dependency changes

## Scope (optional)

The scope provides additional context:

- `feat(navbar): add dropdown menu`
- `fix(footer): correct alignment issue`
- `style(components): format with prettier`

## Breaking Changes

Add `BREAKING CHANGE:` in the footer or use `!` after type:

```bash
feat!: remove deprecated API endpoint

BREAKING CHANGE: The old /api/v1 endpoint has been removed.
Use /api/v2 instead.
```

## Quick Tips

✅ Use present tense: "add feature" not "added feature"  
✅ Don't capitalize first letter: "add" not "Add"  
✅ No period at the end of subject  
✅ Keep subject under 50 characters  
✅ Use body to explain what and why, not how
