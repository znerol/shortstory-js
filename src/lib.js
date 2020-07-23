const HtmlToReact = require('html-to-react');
const React = require('react');

function select(component, selector) {
    if (React.isValidElement(component)) {
        var result = [].concat(...React.Children.toArray(component.props.children).map(subcomp => {
            return select(subcomp, selector);
        }));
        if (selector(component)) {
            result.push(component);
        }
        return result;
    }
    else {
        return [];
    }
}

function flatten(component, selector, parents = []) {
    var path = [...parents];
    if (React.isValidElement(component)) {
        path.push(component);
        const result = [].concat(...React.Children.toArray(component.props.children).map(subcomp => {
            return flatten(subcomp, selector, path);
        }));
        if (selector(component)) {
            result.push(path);
        }
        return result;
    }
    else {
        return [];
    }
}

const templates = {
    Document: function Document(props) {
        return (<body>
            {React.Children.map(props.children, child => select(child, elem => elem.type === templates.Story))}
        </body>);
    },
    Story: function Story(props) {
        const types = [
            templates.Content,
            templates.Br,
        ];
        const flat = [].concat(...React.Children.toArray(props.children).map(child => flatten(child, elem => types.includes(elem.type))));

        const { article } = flat.reduce((accum, val) => {
            const br = val.find(child => child.type === templates.Br);
            const content = val.find(child => child.type === templates.Content);
            const para = val.find(child => child.type === templates.ParagraphStyleRange);
            const span = val.find(child => child.type === templates.CharacterStyleRange);

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
                var section;
                if (para.props.AppliedParagraphStyle === accum.cursection) {
                    section = sections.pop();
                }
                else {
                    section = (<section className={curpara}></section>);
                }

                const paragraphs = React.Children.toArray(section.props.children);
                var paragraph;
                if (para.props.AppliedParagraphStyle === accum.curpara) {
                    paragraph = paragraphs.pop();
                }
                else {
                    paragraph = (<p className={curpara}></p>);
                }

                const texts = React.Children.toArray(paragraph.props.children);
                const text = (<span className={curspan}>{content.props.children}</span>);

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
            article: (<article></article>),
            cursection: "",
            curpara: "",
        });

        return article;
    },
    ParagraphStyleRange: (props) => (props.children),
    CharacterStyleRange: (props) => (props.children),
    Content: (props) => (props.children),
    Br: () => "",
}

const processNodeDefinitions = HtmlToReact.ProcessNodeDefinitions();

const processingInstructions = [
  {
    shouldProcessNode: (node) => node.name in templates,
    processNode: (node, children, index) => React.createElement(templates[node.name], {...node.attribs, key: index}, children),
  },
  {
    shouldProcessNode: (node) => ['cdata', 'directive'].includes(node.type),
    processNode: (_, children) => children,
  },
  {
    shouldProcessNode: HtmlToReact.IsValidNodeDefinitions.alwaysValid,
    processNode: processNodeDefinitions.processDefaultNode,
  },
];

function parse(markup) {
    const parser = new HtmlToReact.Parser({'xmlMode': true});
    return parser.parseWithInstructions(
        markup,
        HtmlToReact.IsValidNodeDefinitions.alwaysValid,
        processingInstructions);
}

module.exports = {
  templates,
  processingInstructions,
  parse
};
