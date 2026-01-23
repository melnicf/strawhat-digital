import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';
import betterTailwind from 'eslint-plugin-better-tailwindcss';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
    },
    plugins: {
      'better-tailwindcss': betterTailwind,
    },
    rules: {
      // Tailwind v4 canonical classes (auto-fixable)
      'better-tailwindcss/enforce-canonical-classes': ['warn', {
        entryPoint: 'src/styles/global.css',
      }],
      // Consistent class order (auto-fixable)
      'better-tailwindcss/enforce-consistent-class-order': ['warn', {
        entryPoint: 'src/styles/global.css',
      }],
      // Remove duplicates (auto-fixable)
      'better-tailwindcss/no-duplicate-classes': 'warn',
      // Remove unnecessary whitespace (auto-fixable)
      'better-tailwindcss/no-unnecessary-whitespace': 'warn',
      // Warn about conflicting classes
      'better-tailwindcss/no-conflicting-classes': ['warn', {
        entryPoint: 'src/styles/global.css',
      }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.astro/'],
  },
];
