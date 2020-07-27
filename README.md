Adobe ICML preprocessor JSX templates
=====================================

[![Build Status](https://travis-ci.org/znerol/shortstory-js.svg?branch=master)](https://travis-ci.org/znerol/shortstory-js)

JSX templates used to produces a simplified structure from Adobe InCopy 4+ ICML
file format. Due to its structure ICML is somewhat hard to transform into
Markup for the Web, especially because ParagraphStyleRanges do not necessarely
correspond exactly to paragraph boundaries.

The simplified structure produced by this stylesheet looks much like a html
fragment and therefore is way easier to transform further:

    <body>
        <article>
            <section class='ParagraphStyle/Title'>
                <p class='ParagraphStyle/Title'>
                    <span class='CharacterStyle/$ID/[No character style]'>
                       Some Title
                    </span>
                </p>
            </section>

            <section class='ParagraphStyle/Body'>
                <p class='ParagraphStyle/Body'>
                    <span class='CharacterStyle/$ID/[No character style]'>
                        Each paragraph of the story resides in exactly one
                        &lt;p&gt;. Guaranteed. Even if some other
                    </span>
                    <span class='CharacterStyle/Bold'>
                        character style
                    </span>
                    <span class='CharacterStyle/$ID/[No character style]'>
                        is applied in the middle of the a paragraph.
                    </span>
                </p>
            </section>
            ...
        </article>
        <article>
            ...
        </article>
        ...
    </body>

License
-------
[GNU Lesser General Public License 3.0 and later](https://www.gnu.org/licenses/lgpl-3.0.en.html)

See Also
--------

* [znerol/Short-Story](https://github.com/znerol/Short-Story) for an XSLT
  version.
