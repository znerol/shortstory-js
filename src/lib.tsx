import * as HtmlToReact from 'html-to-react';
import * as React from 'react';

export function* dfs(node: React.ReactNode, parents = []) : Generator<React.ReactNode[], void, void> {
    const path = [...parents];
    path.push(node);
    if (typeof node === "object" && "props" in node) {
        for (const child of [].concat(...React.Children.toArray(node.props.children))) {
            yield* dfs(child, path)
        }
    }
    yield path
}

export function transform(children: React.ReactNode, options = {article: <article></article>, section: <section></section>, para: <p></p>, span: <span></span>}): React.ReactElement {
    const types = [
        "Content",
        "Br",
    ];
    const flat = [].concat(...React.Children.toArray(children).map(child => Array.from(dfs(child)))).filter(path=> types.includes(path[path.length-1].type));

    const { article } = flat.reduce((accum, val) => {
        const br = val.find(child => child.type === "Br");
        const content = val.find(child => child.type === "Content");
        const para = val.find(child => child.type === "ParagraphStyleRange");
        const span = val.find(child => child.type === "CharacterStyleRange");

        if (br !== undefined) {
            return {
                ...accum,
                curpara: "",
            };
        }
        else if (para !== undefined && span !== undefined && content !== undefined) {
            const curpara = para.props.AppliedParagraphStyle;
            const curspan = span.props.AppliedCharacterStyle;

            const sections = React.Children.toArray(accum.article.props.children);
            let section;
            if (para.props.AppliedParagraphStyle === accum.cursection) {
                section = sections.pop();
            }
            else {
                section = React.cloneElement(options.section, {className: curpara});
            }

            const paragraphs = React.Children.toArray(section.props.children);
            let paragraph;
            if (para.props.AppliedParagraphStyle === accum.curpara) {
                paragraph = paragraphs.pop();
            }
            else {
                paragraph = React.cloneElement(options.para, {className: curpara});
            }

            const texts = React.Children.toArray(paragraph.props.children);
            const text = React.cloneElement(options.span, {className: curspan}, content.props.children);

            return {
                article: React.cloneElement(
                    accum.article, null, ...sections, React.cloneElement(
                        section, null, ...paragraphs, React.cloneElement(
                            paragraph, null, ...texts, text
                        )
                    )
                ),
                cursection: curpara,
                curpara: curpara,
            };
        }
    }, {
        article: React.cloneElement(options.article),
        cursection: "",
        curpara: "",
    });

    return article;
}

const processNodeDefinitions = HtmlToReact.ProcessNodeDefinitions();

export const processingInstructions = [
  {
    shouldProcessNode: (node) => ['cdata', 'directive'].includes(node.type),
    processNode: (_, children) => children,
  },
  {
    shouldProcessNode: HtmlToReact.IsValidNodeDefinitions.alwaysValid,
    processNode: processNodeDefinitions.processDefaultNode,
  },
];

export function parse(markup: string): React.ReactElement {
    const parser = new HtmlToReact.Parser({'xmlMode': true});
    return parser.parseWithInstructions(
        markup,
        HtmlToReact.IsValidNodeDefinitions.alwaysValid,
        processingInstructions);
}
