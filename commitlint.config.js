module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - what types of commits are allowed
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, missing semicolons, etc)
        'refactor', // Code refactoring (neither fixes a bug nor adds a feature)
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'chore', // Maintenance tasks (dependencies, build, etc)
        'ci', // CI/CD changes
        'revert', // Revert a previous commit
      ],
    ],
    // Scope is optional but must be lowercase if provided
    'scope-case': [2, 'always', 'lower-case'],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],
    // Subject must be in lowercase (sentence case)
    'subject-case': [2, 'always', 'lower-case'],
    // Body must have blank line before it
    'body-leading-blank': [2, 'always'],
    // Footer must have blank line before it
    'footer-leading-blank': [2, 'always'],
    // Max header length (type + scope + subject)
    'header-max-length': [2, 'always', 100],
  },
};
