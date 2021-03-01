/**
 * Analyser script. Checks if the *.nazca file contains correct code
 * @author Q'inti qinti.nazca@gmail.com
 */

const file = process.argv[2];
const fs = require('fs');
const path_ = require('path');
const tools = require('./tools');
const jsHint = require('jshint').JSHINT;

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

    // 1. Read the file
    fs.readFile(file, (error, content) => {
        if (error) {
            return console.error(error)
        }
        content = content.toString();
        console.log(JSON.stringify(analyse(file, content), null, 4));
    });
}

function analyse(_file, _content, includedErrors = false) {
    let classMap = {};
    let errors = [];
    let warnings = [];

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

        let prePath = _file.split(/\/|\\/);
        prePath.pop();
        prePath = prePath.join('/');

        try {
            includeContent = fs.readFileSync(path_.join(prePath, value)).toString();
        } catch (e) {
            let [line1, column1] = tools.calculateLineColumn(content, valueStart);
            let [line2, column2] = tools.calculateLineColumn(content, valueEnd);
            [line1, line2] = [line1, line2].map((value) => value + 1);
            errors.push({
                message: 'Included file does not exist',
                line: line1 === line2 ? line1 : [line1, line2],
                column: [column1, column2],
                file: _file,
                level: 'error'
            });
        }
        if (includeContent) {
            let result = analyse(path_.join(prePath, value), includeContent, includedErrors);
            Object.assign(classMap, result.classes);

            if (result.errors.length) {
                let [line1, column1] = tools.calculateLineColumn(content, index);
                let [line2, column2] = tools.calculateLineColumn(content, originalEnd);
                [line1, line2] = [line1, line2].map((value) => value + 1);
                errors.push({
                    message: 'Included file contains errors',
                    line: line1 === line2 ? line1 : [line1, line2],
                    column: [column1, column2],
                    code: 'erroredInclude',
                    file: _file
                });
            }

            if (includedErrors && result.errors.length) {
                errors = errors.concat(result.errors);
            }

            if (result.warnings.length) {
                warnings = warnings.concat(result.warnings);
            }
        }

        index = content.indexOfCode("*include:", valueEnd + 1);
    }

    // 3. Build class map
    let finished = false;
    index = 0;
    while (!finished) {
        try {
            let classes = tools.getClassMap(_file, content, index);
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
                    let warning = {
                        message: err.reason,
                        line: line + err.line,
                        column: err.character,
                        file: cls.file,
                        level: 'warning'
                    };
                    if (_file === cls.file) {
                        warnings.push(warning);
                    }
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
            let children = tools.getChildren(_file, content, index);
            finished = true;
            hierarchy = hierarchy.concat(children);
        } catch (e) {
            errors.push(e);
            hierarchy = hierarchy.concat(e.children);
            index = e.index;
        }
    }

    // 7. Define global parameters
    getChildNames(_file, content, global, hierarchy, errors);

    if (!includedErrors) {
        errors = errors.filter((err) => !err || err.file === _file);
    }

    return {classes: classMap, global, warnings, errors};
}

function getChildNames(_file, content, global, children, errors = []) {
    for (let i = 0, n = children.length; i < n; i++) {
        let name = children[i].name;
        if (name) {
            if (global[name]) {
                let line = tools.calculateLineColumn(content, children[i].start);
                let column = tools.calculateLineColumn(content, children[i].start);
                let columnEnd = content.indexOf('\n');
                line++;
                errors.push({
                    message: `Duplicate global name is found`,
                    line,
                    column: [column, columnEnd],
                    index: children[i].start,
                    file: _file
                });
            } else {
                global[name] = children[i];
            }
        }

        if (children[i].children.length) {
            getChildNames(_file, content, global, children[i].children, errors);
        }
    }
}

module.exports = {
    analyse,
    analyseFile
};
