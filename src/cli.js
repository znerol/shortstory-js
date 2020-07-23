const fs = require('fs');
const ReactDOMServer = require('react-dom/server');
const { parse } = require('.');

const markup = fs.readFileSync(process.argv[2]);
const article = parse(markup);
console.log(ReactDOMServer.renderToStaticMarkup(article));
