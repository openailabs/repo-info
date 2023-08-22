/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig*/
/** @typedef  {import("prettier").Config} PrettierConfig*/
/** @typedef  {{ tailwindConfig: string }} TailwindConfig*/

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
    arrowParens: 'avoid',
    printWidth: 80,
    singleQuote: true,
    jsxSingleQuote: true,
    semi: true,
    trailingComma: 'none',
    tabWidth: 4,
    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
        'prettier-plugin-tailwindcss',
    ],
    tailwindConfig: './packages/config/tailwind',
    importOrderTypeScriptVersion: '4.4.0',
    importOrder: [
        '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
        '^(next/(.*)$)|^(next$)',
        '^(expo(.*)$)|^(expo$)',
        '<THIRD_PARTY_MODULES>',
        '',
        '^@acme/(.*)$',
        '',
        '^~/utils/(.*)$',
        '^~/components/(.*)$',
        '^~/styles/(.*)$',
        '^~/(.*)$',
        '^[./]',
    ],
};

module.exports = config;
