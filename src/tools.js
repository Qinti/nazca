/**
 * Tools contains usefule functions, used by both - analyse.js and compile.js
 * @author Q'inti qinti.nazca@gmail.com
 */

let idCounter = 1;
const alphabet = '_abcdefghijklmnopqrstuvwxyz';
const cssProperties = require('./cssProperties');
const reservedWords = require('./reservedWords');
const joinPath = require('path').join;
const fs = require('fs');

const reObject = /^{?[\s\n]{0,}[#\-<>$@:a-z][a-z\-_\d]+\s{0,}:\s{0,}{/i;
const reVariable = /^{?[\s\n]{0,}[#\-<>$@:a-z][a-z\-_\d]+\s{0,}:\s{0,}.{0,};/i;
const reMethod = /^{?[\s\n]{0,}[#\-<>$@:a-z][a-z\-_\d]+\s{0,}:\s{0,}\([a-z_\d,'"`\s=]{0,}\)\s{0,}{/i;
const reChild = /^{?[\s\n]{0,}[.a-z][a-z\d.\-_]+\s{0,}({|;)/i;

/* eslint-disable no-extend-native */
String.prototype.regexIndexOf = function (regex, startIndex = 0) {
    let indexOf = this.substring(startIndex).search(regex);
    return (indexOf >= 0) ? (indexOf + startIndex) : indexOf;
};

global.stringMap = global.stringMap || {};

function buildStrings(str, inFunctionBody = false) {
    let stringArray = [];

    const quoteRegex = /['"/`:]/;
    let closeSymbol, stringOpening, stringClosing;
    let isBlockComment = false;
    const closeSymbolMap = {};
    if (!inFunctionBody) {
        closeSymbolMap[':'] = ';'
    }

    ['"', "'", '/', '`'].forEach((symbol) => {
        closeSymbolMap[symbol] = symbol
    });

    for (let i = 0, n = str.length; i < n; i++) {
        let character = str.charAt(i);
        if (closeSymbol) {
            if ((character === closeSymbol || str.charCodeAt(i) === closeSymbol) && !/\\/.test(str.charAt(i - 1))) {
                if (isBlockComment && str.charAt(i - 1) !== '*') {
                    continue;
                }

                stringClosing = i;
                i = addString() + 1;
                closeSymbol = null;
                isBlockComment = false;
            }
        } else {
            if (quoteRegex.test(character)) {
                // skip states
                if (character === ':') {
                    let k = i - 1;
                    while (k > 0 && /[\n\s\t]/.test(str.charAt(k))) {
                        k--;
                    }
                    if (str.charAt(k) === ';') {
                        continue;
                    }
                }

                closeSymbol = closeSymbolMap[character];
                if (character === '/' && str.charAt(i + 1) === '/') {
                    closeSymbol = 13;
                }

                if (closeSymbol === '/' && str.charAt(i + 1) === '*') {
                    isBlockComment = true;
                }
                stringOpening = i + 1;
            }
        }
    }

    function addString() {
        if (closeSymbol === ';') {
            stringOpening++;

            while (str.charAt(stringOpening) === ' ') {
                stringOpening++;
            }

            while (str.charAt(stringOpening) === ' ') {
                stringClosing--;
            }

            // for methods
            if (str.charAt(stringOpening) === '(') {
                let methodStart = str.indexOf('{', stringOpening);
                let methodEnd = findClosingBracket(str, methodStart) + 1;
                if (methodEnd < 0) {
                    return methodStart;
                }
                return methodEnd + 1;
            }

            // for objects
            if (str.charAt(stringOpening) === '{') {
                let objectEnd = findClosingBracket(str, stringOpening);
                if (objectEnd < 0) {
                    return stringOpening;
                }

                let subString = str.slice(stringOpening, objectEnd + 1);
                subString = buildStrings(subString);
                for (let t = 0, p = global.stringMap[subString].length; t < p; t++) {
                    if (global.stringMap[subString][t]) {
                        stringArray[t + stringOpening] = 1;
                    }
                }

                return stringOpening + subString.length + 1;
            }
        }

        let final = stringClosing;
        if (str.charAt(final) === ';') {
            final--;
        }
        for (let k = stringOpening; k < final + 1; k++) {
            stringArray[k] = 1;
        }

        return stringClosing;
    }

    setStrings(str, stringArray);

    return str;
}

function inString(str, index) {
    if (global.stringMap[str]) {
        return !!global.stringMap[str][index];
    }

    return false;
}

function setStrings(str, stringArray) {
    global.stringMap[str] = stringArray;
}

/* eslint-disable no-extend-native */
String.prototype.indexOfCode = function (pattern, startIndex = 0) {
    let index = this.indexOf(pattern, startIndex);
    while (index >= 0 && inString(this, index)) {
        index = this.indexOf(pattern, index + 1);
    }

    return index;
};

/* eslint-disable no-extend-native */
String.prototype.splitLines = function () {
    let previousIndex = 0;
    let lines = [];
    let index;

    index = this.indexOfCode(';');
    let index2 = this.indexOfCode('\n');
    if ((index2 < index || index <= 0) && index2 >= 0) {
        index = index2;
    }
    while (index >= 0) {
        lines.push(this.slice(previousIndex, index + 1));
        previousIndex = index + 1;
        index = this.indexOfCode(';', previousIndex);
        index2 = this.indexOfCode('\n', previousIndex);
        if ((index2 < index || index <= 0) && index2 >= 0) {
            index = index2;
        }
    }

    lines.push(this.slice(previousIndex));

    lines = lines.filter((line) => line.trim().length);

    return lines;
};

function findClosingBracket(content, openBracket) {
    let bracketCount = -1;
    for (let i = openBracket + 1, n = content.length; i < n; i++) {
        if (content[i] === '{') {
            bracketCount--;
        } else if (content[i] === '}') {
            bracketCount++;
        }

        if (bracketCount === 0) {
            return i;
        }
    }
}

function resetID() {
    idCounter = 1;
}

function nextID() {
    idCounter++;
    let id = '';
    const n = alphabet.length;
    let counter = idCounter;

    while (counter) {
        let next = counter % n;
        if (!next) {
            idCounter++;
        }
        id += alphabet[next || 1];
        counter = Math.floor(counter / n);
    }
    let returnValue = id.split("").reverse().join("");
    // Sequentially generated IDs could be reserved words
    if (reservedWords[returnValue]) {
        return nextID();
    }
    return returnValue;
}

function calculateLineColumn(content, position) {
    let line = 0;
    let column = 0;

    for (let i = 0; i < position; i++) {
        if (content.charAt(i) === '\n') {
            line++;
            column = 0;
        }
        column++;
    }

    return [line, column];
}

function getClassMap(_file, content, startIndex) {
    let classMap = {};
    let start = indexOfClassDeclaration(content, startIndex);
    while (start >= 0) {
        let openBracket = content.indexOfCode('{', start);
        if (openBracket < 0) {
            let [line, column] = calculateLineColumn(content, start);
            throw {
                message: 'Missing { for class definition',
                line,
                column: [column, column + 5],
                index: start,
                classMap,
                file: _file,
                level: 'error'
            };
        }

        if (!/^class ([a-z_$][a-z\d_$]+)(?:\s*<\s*[a-z_$][a-z_\d$]*)*\s*{/i.test(content.slice(start, openBracket + 1))) {
            let [line1, column1] = calculateLineColumn(content, start);
            let [line2, column2] = calculateLineColumn(content, openBracket);
            throw {
                message: 'Class declaration is invalid',
                line: line1 === line2 ? line1 : [line1, line2],
                column: [column1, column2],
                index: openBracket,
                classMap,
                file: _file,
                level: 'error'
            };
        }

        let closingBracket = findClosingBracket(content, openBracket);
        if (closingBracket < 0) {
            let [line, column] = calculateLineColumn(content, start);
            throw {
                message: 'Missing } for class definition',
                line,
                column: column + 5,
                index: start + 5,
                classMap,
                file: _file,
                level: 'error'
            };
        }

        parseClass(content.slice(start, closingBracket + 1), start);
        start = indexOfClassDeclaration(content, closingBracket + 1);
    }

    function parseClass(classDeclaration, start) {
        let firstBracket = classDeclaration.indexOfCode('{');
        let declaration = classDeclaration.slice(0, firstBracket);
        declaration = declaration.replace('class ', '').replace('{', '');
        let hierarchy = declaration.split('<');

        let className = hierarchy.shift().trim();
        let parents = hierarchy.map((cls) => cls.trim());
        classMap[className] = {
            parents,
            variables: {private: {}, protected: {}, public: {}},
            style: {},
            attributes: {},
            setters: {},
            getters: {},
            eventHandlers: {},
            states: {},
            methods: {private: {}, protected: {}, public: {}},
            children: [],
            file: _file
        };

        let property;
        try {
            property = parseNextProperty(firstBracket + 1);
        } catch (err) {
            Object.assign(err, {classMap});
            throw err;
        }
        while (property) {
            const typeMap = {
                variable: 'variables',
                css: 'style',
                attribute: 'attributes',
                method: 'methods',
                setter: 'setters',
                getter: 'getters',
                eventHandler: 'eventHandlers',
                state: 'states'
            };
            let [line, column] = calculateLineColumn(content, firstBracket + 1)
            if (property.type === 'css' && typeof property.value !== 'string') {
                throw {
                    message: `CSS property '${property.name}' can not be overridden`,
                    line,
                    column,
                    index: firstBracket + 1,
                    classMap,
                    file: _file,
                    level: 'error'
                };
            }

            if (property.type === 'variable' || property.type === 'method') {
                classMap[className][typeMap[property.type]][property.access][property.name] = property.value;
            } else if (property.type !== 'child') {
                classMap[className][typeMap[property.type]][property.name] = property.value;
            } else {
                classMap[className].children.push(property);
            }

            try {
                property = parseNextProperty((property.index || property.end) - start + 2);
            } catch (err) {
                Object.assign(err, {classMap});
                throw err;
            }
        }

        function parseNextProperty(index) {
            let nextProperty = classDeclaration.slice(index).trim();
            if (!nextProperty || nextProperty === '}') {
                return null;
            }

            if (nextProperty.charAt(0) === '/') {
                if (nextProperty.charAt(1) === '/') {
                    index = classDeclaration.indexOf('//', index);
                    index = classDeclaration.indexOf('\n', index);
                } else {
                    index = classDeclaration.indexOf('/*', index);
                    index = classDeclaration.indexOf('*/', index) + 2;
                }
                return parseNextProperty(index);
            }

            if (reMethod.test(nextProperty) || reObject.test(nextProperty) || reVariable.test(nextProperty)) {
                return parseProperty(_file, content, start + index);
            } else if (reChild.test(nextProperty)) {
                return getNextChild(_file, content, start + index);
            } else {
                let [line1, column1] = calculateLineColumn(content, start + index);
                let nextColon = content.indexOfCode(';', start + index);
                if (nextColon < 0) {
                    nextColon = content.length - 1;
                }
                let [line2, column2] = calculateLineColumn(content, nextColon);

                throw {
                    message: 'The property is invalid',
                    line: line1 === line2 ? line1 : [line1, line2],
                    column: [column1, column2],
                    index: nextColon,
                    file: _file,
                    level: 'error'
                };
            }
        }
    }

    return classMap;
}

function parseProperty(_file, content, index) {
    let nameEnd = content.indexOfCode(':', index);
    if (nameEnd < 0) {
        return null;
    }

    if (!content.slice(index + 1, nameEnd).trim().length) {
        nameEnd = content.indexOfCode(':', nameEnd + 1);
    }

    let name = content.slice(index + 1, nameEnd).trim();
    let nameTest = name;
    if (/[#\-<>$@:]/.test(name.charAt(0))) {
        nameTest = name.slice(1);
    }
    if (!/[a-z\d-]/i.test(nameTest)) {
        let [line, column1] = calculateLineColumn(content, index + 1);
        /* eslint-disable no-unused-vars */
        let [line2, column2] = calculateLineColumn(content, nameEnd);
        throw {
            message: `Invalid property name '${name}'`,
            line,
            column: [column1, column2],
            index: nameEnd,
            file: _file,
            level: 'error'
        };
    }

    let operator;
    let value;
    let type;
    let access = 'public';
    if (/[#\-<>$@:]/.test(name[0])) {
        operator = name[0];
        name = name.slice(1).trim();
    }
    let afterName = content.slice(nameEnd + 1).replace(/$\s+/, '').trim();
    if (afterName[0] === '(') { // it's a function
        type = 'method';
        let inputStart = content.indexOfCode('(', nameEnd + 1);
        let inputEnd = content.indexOfCode(')', inputStart + 1);
        let input = content.slice(inputStart + 1, inputEnd);
        let parameters = input.split(',').map((parameter) => parameter.trim());

        let bodyStart = content.indexOfCode('{', inputEnd);
        let bodyEnd = findClosingBracket(content, bodyStart);
        let body = content.slice(bodyStart, bodyEnd + 1);

        value = {parameters, body, boundaries: [bodyStart, bodyEnd]};
        index = bodyEnd + 1;
    } else if (afterName[0] === '{') {
        type = 'variable';
        let bodyStart = content.indexOfCode('{', nameEnd + 1);
        let bodyEnd = findClosingBracket(content, bodyStart);
        let body = content.slice(bodyStart, bodyEnd + 1);
        index = bodyEnd + 2;
        value = body;
    } else {
        let nextColon = content.indexOfCode(';', nameEnd + 1);
        while (content[nextColon - 1] === '\\') {
            nextColon = content.indexOfCode(';', nextColon + 1);
        }

        nameEnd++;
        while (content.charAt(nameEnd) === ' ') {
            nameEnd++;
        }
        nextColon--;
        while (content.charAt(nextColon) === ' ') {
            nextColon--;
        }

        value = content.slice(nameEnd, nextColon + 1).trim().replace(/\\;/g, ';');
        /* if (value[0] !== '/' && value[0] !== '[' && parseInt(value) != value) {
            value = `'${value.replace(/'/g, `\\'`)}'`;
        } */
        type = 'variable';
        index = nextColon;
    }

    const operatorMap = {
        '#': () => {
            access = 'protected'
        },
        '-': () => {
            access = 'private'
        },
        '<': () => {
            type = 'getter'
        },
        '>': () => {
            type = 'setter'
        },
        '$': () => {
            type = 'attribute'
        },
        '@': () => {
            type = 'eventHandler'
        },
        ':': () => {
            type = 'state'
        }
    };

    if (operator) {
        operatorMap[operator]();
    }

    if (cssProperties[name] === 1 && type !== 'attribute') {
        type = 'css';
    }

    return {
        name, type, access, value, index
    }
}

function getNextChild(_file, content, index = 0) {
    let elementIndex = findChildIndex(_file, content, index);
    let openingBracket = content.indexOfCode('{', elementIndex);
    let semiColon = content.indexOfCode(';', elementIndex);
    let closingBracket = findClosingBracket(content, openingBracket);

    if (openingBracket < 0) {
        openingBracket = Infinity;
    }
    if (semiColon < 0) {
        semiColon = Infinity;
    }

    let declaration = content.slice(index, Math.min(openingBracket, semiColon)).trim();

    if (/^\/\//.test(declaration)) {
        let nextEndLine = content.indexOf('\n', index + 2);
        return getNextChild(_file, content, nextEndLine + 1);
    } else if (/^\/\*/.test(declaration)) {
        let blockCommentEnd = content.indexOf('*/', index + 2);
        return getNextChild(_file, content, blockCommentEnd + 2);
    }

    let children = [];
    let classes = declaration.split('.');
    let name = classes.shift();
    if (!name) {
        name = null;
    }

    let properties = {
        variables: {private: {}, protected: {}, public: {}},
        style: {},
        attributes: {},
        setters: {},
        getters: {},
        eventHandlers: {},
        methods: {private: {}, protected: {}, public: {}}
    };

    if (semiColon < openingBracket) {
        return Object.assign({
            start: elementIndex,
            end: semiColon + 1,
            name,
            classes,
            children,
            type: 'child'
        }, properties);
    }

    let nextChildEnd = openingBracket + 1;
    let nextOpeningBracket = content.indexOfCode('{', nextChildEnd);
    let nextSemiColon = content.indexOfCode(';', nextChildEnd);
    nextOpeningBracket = Math.min(nextOpeningBracket, nextSemiColon);
    let nextColon = content.indexOfCode(':', nextChildEnd);

    while (
        (nextOpeningBracket >= 0 && nextOpeningBracket < closingBracket) ||
        (nextColon >= 0 && nextColon < closingBracket) ||
        (nextSemiColon >= 0 && nextSemiColon < closingBracket)) {
        if (nextColon >= 0 && (nextColon < nextOpeningBracket || nextOpeningBracket < 0)) {
            let property = parseProperty(_file, content, nextChildEnd + 2);
            const typeMap = {
                variable: 'variables',
                css: 'style',
                attribute: 'attributes',
                method: 'methods',
                setter: 'setters',
                getter: 'getters',
                eventHandler: 'eventHandlers',
                state: 'states'
            };
            if (property.type === 'css' && typeof property.value !== 'string') {
                let [line, column] = calculateLineColumn(content, nextChildEnd + 2);
                throw {
                    message: `CSS property '${property.name}' can not be overridden`,
                    line,
                    column,
                    index: nextChildEnd + 2,
                    file: _file,
                    level: 'error'
                };
            }

            if (property.type === 'variable' || property.type === 'method') {
                properties[typeMap[property.type]][property.access][property.name] = property.value;
            } else {
                properties[typeMap[property.type]][property.name] = property.value;
            }
            nextChildEnd = property.index + 2;
        } else {
            let nextChild = getNextChild(_file, content, nextChildEnd);
            nextChildEnd = nextChild.end + 1;
            children.push(nextChild);
        }

        nextOpeningBracket = content.indexOfCode('{', nextChildEnd);
        nextColon = content.indexOfCode(':', nextChildEnd);
        nextSemiColon = content.indexOfCode(';', nextChildEnd);
        nextOpeningBracket = Math.min(nextOpeningBracket, nextSemiColon);
    }

    return Object.assign({
        start: elementIndex,
        end: closingBracket + 1,
        name,
        classes,
        children,
        type: 'child'
    }, properties);
}

function getChildren(_file, content, index = 0) {
    const reInclude = /^\*include/;
    const reJSON = /^\*json/;
    const reFontFace = /^\*font-face/;
    const reClass = /^class /;
    const reComment = /^\/\//;
    const reBlockComment = /^\/\*/;
    let children = [];

    let nextWord = content.slice(index).trim();
    while (index >= 0 && nextWord) {
        if (reInclude.test(nextWord) || reJSON.test(nextWord)) {
            index = content.indexOfCode(';', index) + 1;
        } else if (reFontFace.test(nextWord)) {
            let openingBracket = content.indexOfCode('{', index);
            let closingBracket = findClosingBracket(content, openingBracket);
            index = content.indexOfCode(';', closingBracket) + 1;
        } else if (reClass.test(nextWord)) {
            let openingBracket = content.indexOfCode('{', index);
            let closingBracket = content.indexOfCode('}', index);
            if (closingBracket < openingBracket) {
                let previousIndex = index;
                index = content.indexOf(';', closingBracket) + 1;
                let [line1, column1] = calculateLineColumn(content, previousIndex);
                let [line2, column2] = calculateLineColumn(content, index);
                throw {
                    message: `Class should have an opening bracket`,
                    line: line1 === line2 ? line1 : [line1, line2],
                    column: [column1, column2],
                    index,
                    children,
                    file: _file,
                    level: 'error'
                };
            }

            closingBracket = findClosingBracket(content, openingBracket);
            index = closingBracket + 2;
        } else if (reComment.test(nextWord)) {
            index = content.indexOf('//', index);
            index = content.indexOf('\n', index + 2) + 1;
        } else if (reBlockComment.test(nextWord)) {
            index = content.indexOf('*/', index + 2) + 2
        } else if (reChild.test(nextWord)) {
            let child = getNextChild(_file, content, index);
            children.push(child);
            index = child.end + 1;
        } else if (nextWord === '}') {
            break;
        } else {
            let nextSemiColon = content.indexOf(';', index);
            let [line1, column1] = calculateLineColumn(content, index);
            let [line2, column2] = calculateLineColumn(content, nextSemiColon);
            throw {
                message: `The statement is not recognized. Should be *include, *json, *font-face, class or hierarchy`,
                line: line1 === line2 ? line1 : [line1, line2],
                column: [column1, column2],
                index: nextSemiColon + 1,
                children,
                file: _file,
                level: 'error'
            };
        }

        nextWord = content.slice(index).trim();
    }

    return children;
}

function findChildIndex(_file, content, index) {
    let closeSymbol;
    const quoteRegex = /['"/`]/;
    if (index < 0) {
        return -1;
    }
    for (let i = index, n = content.length; i < n; i++) {
        if (closeSymbol) {
            if (content.charAt(i) === closeSymbol && !/\\/.test(content.charAt(i - 1))) {
                closeSymbol = null;
            }
        } else if (quoteRegex.test(content.charAt(i))) {
            closeSymbol = content.charAt(i);
        } else {
            if (/[.a-z_\-\d]/i.test(content.charAt(i))) {
                return i;
            } else if (!/[\t\s\n]/i.test(content.charAt(i))) {
                let [line, column] = calculateLineColumn(content, i);
                throw {
                    message: `Unexpected symbol '${content.charAt(i)}'`,
                    line,
                    column,
                    index: i,
                    file: _file,
                    level: 'error'
                };
            }
        }
    }

    return -1;
}

function getListOfJSONFiles(_file, content) {
    let jsonIndex = 0;
    jsonIndex = content.indexOfCode('*json', jsonIndex);
    let jsonFiles = [];
    while (jsonIndex >= 0) {
        let valueStart = content.indexOfCode(':', jsonIndex);
        let valueEnd = content.indexOfCode(';', jsonIndex);
        let jsonValue = content.slice(valueStart + 1, valueEnd).trim();
        let name = jsonValue.split('=');
        let value = name[1].trim();
        name = name[0].trim();

        if (!name || !value) {
            let [line1, column1] = calculateLineColumn(content, jsonValue);
            let [line2, column2] = calculateLineColumn(content, valueEnd);

            throw {
                message: `*json directive is invalid. Should be in format of '*json: objectName=path/to/file.json;'`,
                line: line1 === line2 ? line1 : [line1, line2],
                column: [column1, column2],
                index: valueEnd,
                file: _file,
                level: 'error'
            }
        }

        jsonFiles.push({name, value});
        jsonIndex = content.indexOfCode('*json', valueEnd);
    }

    return jsonFiles;
}

function makeVariable(str) {
    return `${str.replace(/[^a-z\d_$]/ig, '_')}`;
}

function flattenNazcaConfig(content) {
    let index = 0;
    [
        {openSymbol: '/*', closeSymbol: '*/'},
        {openSymbol: '//', closeSymbol: '\n', replacement: '\n'}
    ].forEach(({openSymbol, closeSymbol, replacement}) => {
        index = 0;
        while (index >= 0) {
            index = content.indexOf(openSymbol);

            if (index >= 0) {
                let close = content.indexOf(closeSymbol, index + openSymbol.length);
                content = `${content.slice(0, index)}${replacement || ''}${content.slice(close + closeSymbol.length)}`;
            }
        }
    });

    return content;
}

function findIncludesRecursively(file) {
    let prePath = file.split(/\/|\\/);
    prePath.pop();
    prePath = prePath.join('/');

    let fileContent = fs.readFileSync(file);
    const reIncludeMatch = /\*include:\s{1,}[^<>:"|?*]+;/gi;
    const reIncludeExec = /\*include:\s{1,}([^<>:"|?*]+);/i;
    let returnArray = fileContent.toString().match(reIncludeMatch);
    if (returnArray) {
        returnArray = returnArray.map((value) => {
            return reIncludeExec.exec(value)[1];
        });
    } else {
        returnArray = [];
    }

    returnArray = returnArray.map((file) => {
        return joinPath(prePath, file).replace(/\\/g, '/');
    });

    returnArray.forEach((file) => {
        returnArray = returnArray.concat(findIncludesRecursively(file));
    });

    return returnArray;
}

function indexOfClassDeclaration(content, index = 0) {
    while (true) {
        index = content.indexOfCode('class ', index);;
        if (index <= 0) {
            return index;
        }

        let previous = content.charAt(index - 1);
        if (previous === ' ' || previous === '\n') {
            return index;
        }
        index++;
    }
}

module.exports = {
    buildStrings,
    findClosingBracket,
    nextID,
    getClassMap,
    calculateLineColumn,
    getChildren,
    resetID,
    getListOfJSONFiles,
    makeVariable,
    flattenNazcaConfig,
    findIncludesRecursively,
    indexOfClassDeclaration
};
