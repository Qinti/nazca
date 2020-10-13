/**
 * Analyser script. Checks if the *.nazca file contains correct code
 * @author Q'inti qinti.nazca@gmail.com
 */

const file = process.argv[2];
const fs = require('fs');
const tools = require('./tools');
const jsHint = require('jshint').JSHINT;
let prePath = '';

if (process.argv.length === 3) {
    analyseFile(`./${file}`);
}

function analyseFile(file) {
    /**
     * Algorithm:
     * 1. Read the file
     * 2. Validate all includes and comment them out
     * 3. Build class map
     * 4. Validate JS code inside the functions with JSHint
     * 5. Comment out all classes
     * 6. Build hierarchy, if any
     * 7. Define global parameters
     */

    let pathSplit = file.split('/');
    pathSplit.pop();
    prePath = `${pathSplit.join('/')}`;

    // 1. Read the file
    fs.readFile(file, (error, content) => {
        if (error) {
            return console.error(error)
        }
        content = content.toString();
        console.log(JSON.stringify(analyse(content)));
    });
}

function analyse(_content, _includedFiles = {}) {
    let classMap = {};
    let errors = [];

    let content = _content;

    content = tools.buildStrings(content);
    let index = 0;
    index = content.indexOfCode("*include:", index);

    while (index >= 0) {
        let valueStart = index + 10;
        while ([` `, `'`].includes(content.charAt(valueStart))) {
            valueStart++;
        }

        let valueEnd = content.indexOfCode(';', index + 10);
        let originalEnd = valueEnd;
        while ([` `, `'`].includes(content.charAt(valueEnd))) {
            valueEnd--;
        }

        let value = content.slice(valueStart, valueEnd);

        let includeContent;
        try {
            if (_includedFiles[value]) {
                includeContent = _includedFiles[value];
            } else {
                includeContent = fs.readFileSync(`${prePath}/${value}`).toString();
            }
        } catch (e) {
            let [line1, column1] = tools.calculateLineColumn(content, valueStart);
            let [line2, column2] = tools.calculateLineColumn(content, valueEnd);
            errors.push({
                message: 'Included file does not exist',
                line: line1 === line2 ? line1 : [line1, line2],
                column: [column1, column2]
            });
        }
        if (includeContent) {
            let result = analyse(includeContent);
            Object.assign(classMap, result.classes);

            if (result.errors.length) {
                let [line1, column1] = tools.calculateLineColumn(content, index);
                let [line2, column2] = tools.calculateLineColumn(content, originalEnd);
                errors.push({
                    message: 'Included file is not valid nazca code',
                    line: line1 === line2 ? line1 : [line1, line2],
                    column: [column1, column2]
                });
            }
        }

        index = content.indexOfCode("*include:", valueEnd + 1);
    }

    // 3. Build class map
    let finished = false;
    index = 0;
    while (!finished) {
        try {
            let classes = tools.getClassMap(content, index);
            Object.assign(classMap, classes);
            finished = true;
        } catch (e) {
            if (e.length) {
                errors = errors.concat(e);
            } else {
                errors.push(e);
            }
            index = e.index;
            Object.assign(classMap, e.classMap);
        }
    }

    // 4. Validate JS code inside the functions with JSHint
    for (let className in classMap) {
        let cls = classMap[className];
        for (let method in cls.methods.public) {
            let result = jsHint(cls.methods.public[method].body, {esversion: 6});

            if (!result) {
                jsHint.errors.forEach((err) => {
                    let [line] = tools.calculateLineColumn(content, cls.methods.public[method].boundaries[0]);
                    let error = {
                        message: err.reason,
                        line: line + err.line,
                        column: err.character
                    };
                    errors.push(error);
                });
            }
        }
    }

    // 6. Build hierarchy, if any
    let global = {};
    let hierarchy = [];
    finished = false;
    index = 0;
    while (!finished) {
        try {
            let children = tools.getChildren(content, index);
            finished = true;
            hierarchy = hierarchy.concat(children);
        } catch (e) {
            errors.push(e);
            hierarchy = hierarchy.concat(e.children);
            index = e.index;
        }
    }

    // 7. Define global parameters
    getChildNames(content, global, hierarchy, errors);

    return {classes: classMap, errors, global};
}

function getChildNames(content, global, children, errors = []) {
    for (let i = 0, n = children.length; i < n; i++) {
        let name = children[i].name;
        if (name) {
            if (global[name]) {
                let line = tools.calculateLineColumn(content, children[i].start);
                let column = tools.calculateLineColumn(content, children[i].start);
                let columnEnd = content.indexOf('\n');
                errors.push({
                    message: `Duplicate global name is found`,
                    line,
                    column: [column, columnEnd],
                    index: children[i].start
                });
            } else {
                global[name] = children[i];
            }
        }

        if (children[i].children.length) {
            getChildNames(content, global, children[i].children, errors);
        }
    }
}

module.exports = {
    analyse,
    analyseFile
};
