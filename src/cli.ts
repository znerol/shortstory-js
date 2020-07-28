import * as fs from 'fs';
import * as ReactDOMServer from 'react-dom/server';
import { parse, transform } from '.';

const markup = fs.readFileSync(process.argv[2]);
const article = transform(parse(markup.toString()));
console.log(ReactDOMServer.renderToStaticMarkup(article));
