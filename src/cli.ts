import * as fs from 'fs';
import * as ReactDOMServer from 'react-dom/server';
import { parse } from '.';

const markup = fs.readFileSync(process.argv[2]);
const article = parse(markup.toString());
console.log(ReactDOMServer.renderToStaticMarkup(article));
