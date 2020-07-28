import * as HtmlToReact from 'html-to-react';
import * as React from 'react';

interface DfsOptions {
    prune?: (path: React.ReactNode[]) => boolean;
    select?: (path: React.ReactNode[]) => boolean;
}

export function* dfs(children: React.ReactNode, options: DfsOptions = {}, parents = []) : Generator<React.ReactNode[], void, void> {
    for (const node of React.Children.toArray(children)) {
        const path = [...parents];
        path.push(node);
        if ((options.prune && !options.prune(path)) && typeof node === "object" && "props" in node) {
            yield* dfs(node.props.children, options, path)
        }
        if (options.select && options.select(path)) {
            yield path
        }
    }
}

interface TransformOptions {
    article: React.ReactElement;
    section: React.ReactElement;
    para: React.ReactElement;
    span: React.ReactElement;
}

export function isElementOfType(node: React.ReactNode, ...types : string[]): boolean {
    return typeof node === "object" &&
        "type" in node &&
        typeof node.type === "string" &&
        types.includes(node.type);
}

export function transform(children: React.ReactNode, options: TransformOptions = {article: <article></article>, section: <section></section>, para: <p></p>, span: <span></span>}): React.ReactElement {
    const dfsopts : DfsOptions = {
        prune: path => isElementOfType(path[path.length-1], "Content", "Br"),
        select: path => isElementOfType(path[path.length-1], "Content", "Br"),
    }

    const flat = Array.from(dfs(children, dfsopts));

    const { article } = flat.reduce((accum, val) => {
        const br = val.find(child => isElementOfType(child, "Br")) as React.ReactElement;
        const content = val.find(child => isElementOfType(child, "Content")) as React.ReactElement;
        const para = val.find(child => isElementOfType(child, "ParagraphStyleRange")) as React.ReactElement;
        const span = val.find(child => isElementOfType(child, "CharacterStyleRange")) as React.ReactElement;

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
