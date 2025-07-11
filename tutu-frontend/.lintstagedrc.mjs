const eslintCommand = 'eslint --fix --no-ignore --max-warnings=0';
const prettierCommand = 'prettier --write -u';
const spotlessCommand = 'cd ../tutu-backend && mvn spotless:apply';

const config = {
  '../**/*.{js,mjs,cjs,jsx,ts,tsx}': [eslintCommand, prettierCommand],
  '../!**/*.{js,mjs,cjs,jsx,ts,tsx}': prettierCommand,
  '../**/*.{scala}': spotlessCommand,
};

export default config;
