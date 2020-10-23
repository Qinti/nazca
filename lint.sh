# This is a script that automatically fixes the lint issues in your src files
# For it to work, you should install 'eslint' globally
# npm -g eslint
eslint --fix src/analyse.js
eslint --fix src/compile.js
eslint --fix src/cssProperties.js
eslint --fix src/htmlTags.js
eslint --fix src/reservedWords.js
eslint --fix src/tools.js
eslint --fix bin.js