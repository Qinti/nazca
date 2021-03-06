/**
 * List of HTML tags
 * @author Q'inti qinti.nazca@gmail.com
 */

const tags = [
    'html',
    'base',
    'head',
    'link',
    'meta',
    'script',
    'style',
    'title',
    'body',
    'address',
    'article',
    'aside',
    'footer',
    'header',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hgroup',
    'main',
    'nav',
    'section',
    'blockquote',
    'cite',
    'dd',
    'dt',
    'dl',
    'div',
    'figcaption',
    'figure',
    'hr',
    'li',
    'ol',
    'p',
    'pre',
    'ul',
    'a',
    'abbr',
    'b',
    'bdi',
    'bdo',
    'br',
    'code',
    'data',
    'time',
    'dfn',
    'em',
    'i',
    'kbd',
    'mark',
    'q',
    'rb',
    'ruby',
    'rp',
    'rt',
    'rtc',
    's',
    'del',
    'ins',
    'samp',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'u',
    'var',
    'wbr',
    'area',
    'map',
    'audio',
    'img',
    'track',
    'video',
    'embed',
    'iframe',
    'object',
    'param',
    'picture',
    'source',
    'canvas',
    'noscript',
    'caption',
    'col',
    'colgroup',
    'table',
    'tbody',
    'tr',
    'td',
    'tfoot',
    'th',
    'thead',
    'button',
    'datalist',
    'option',
    'fieldset',
    'label',
    'form',
    'input',
    'legend',
    'meter',
    'optgroup',
    'select',
    'output',
    'progress',
    'textarea',
    'details',
    'dialog',
    'menu',
    'summary',
    'slot',
    'template',
    'acronym',
    'applet',
    'basefont',
    'bgsound',
    'big',
    'blink',
    'center',
    'command',
    'content',
    'dir',
    'element',
    'font',
    'frame',
    'frameset',
    'image',
    'isindex',
    'keygen',
    'listing',
    'marquee',
    'menuitem',
    'multicol',
    'nextid',
    'nobr',
    'noembed',
    'noframes',
    'plaintext',
    'shadow',
    'spacer',
    'strike',
    'tt',
    'xmp'
];

let tagMap = {};
tags.forEach((property) => {
    tagMap[property] = 1;
});

module.exports = tagMap;
