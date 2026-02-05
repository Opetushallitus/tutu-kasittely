const eslintCommand = 'eslint --fix --no-ignore --max-warnings=0';
const prettierCommand = 'prettier --write -u';
const typecheckerCommand = 'tsc --noEmit';

const config = {
  '**/*.ts?(x)': () => typecheckerCommand,
  '**/*.{js,mjs,cjs,jsx,ts,tsx}': [eslintCommand, prettierCommand],
  '!**/*.{js,mjs,cjs,jsx,ts,tsx}': prettierCommand,
};

export default config;
