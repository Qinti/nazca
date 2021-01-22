module.exports = (html) => {
    let hasHTML = html.indexOf('<html') >= 0;

    let parsedHTML = {
        hasHTML,
        addToHead: (text) => {
            let headEnd = html.indexOf('</head>');
            if (headEnd < 0) {
                headEnd = html.indexOf('<body');
                html = `${html.slice(0, headEnd)}\n<head>\n</head>\n${html.slice(headEnd)}`;
                headEnd = html.indexOf('</head>');
            }

            html = `${html.slice(0, headEnd)}${text}\n${html.slice(headEnd)}`;
        }
    };

    Object.defineProperties(parsedHTML, {
        html: {
            get: () => html
        }
    });

    return parsedHTML;
};