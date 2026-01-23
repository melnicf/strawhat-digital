export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only changes
        'style',    // Changes that don't affect code meaning (white-space, formatting, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding or updating tests
        'chore',    // Changes to build process or auxiliary tools
        'revert',   // Revert a previous commit
        'ci',       // CI/CD changes
        'build',    // Changes to build system or dependencies
      ],
    ],
    'subject-case': [0], // Allow any case in commit message subject
  },
};
