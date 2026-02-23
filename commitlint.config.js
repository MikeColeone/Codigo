module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert'
      ]
    ],
    'subject-case': [0], // 不限制 subject 大小写
    'subject-max-length': [2, 'always', 100] // subject 最长 100 字符
  }
}