let idCounter = 0;
const alphabet = '_abcdefghijklmnopqrstuvwxyz';
const cssProperties = require('./cssProperties');

String.prototype.regexIndexOf = function (regex, startIndex = 0) {
    let indexOf = this.substring(startIndex).search(regex);
    return (indexOf >= 0) ? (indexOf + startIndex) : indexOf;
};

function addQuotes(str) {
    let index = 0;
    let stringOpening = 0;
    let stringClosing = 0;

    while (index >= 0 && stringOpening >= 0 && stringClosing >= 0) {
        stringOpening = str.indexOf(':', index + 1);
        if (!str.slice(index + 1, stringOpening).trim().length) {
            index = stringOpening + 1;
            continue;
        }
        while (stringOpening >= 0 && str.charAt(stringOpening - 1) === '\\') {
            stringOpening = str.indexOf(':', stringOpening + 1);
        }
        if (stringOpening < 0) {
            break;
        }

        stringClosing = str.indexOf(';', stringOpening);
        while (stringClosing >= 0 && str.charAt(stringClosing - 1) === '\\') {
            stringClosing = str.indexOf(':', stringClosing + 1);
        }
        if (stringClosing < 0) {
            break;
        }

        stringOpening++;
        stringClosing--;

        while (str.charAt(stringOpening) === ' ') {
            stringOpening++;
        }

        while (str.charAt(stringOpening) === ' ') {
            stringClosing--;
        }

        //for methods
        if (str.charAt(stringOpening) === '(') {
            let methodStart = str.indexOfCode('{', stringOpening);
            let methodEnd = findClosingBracket(str, methodStart + 1);
            if (methodEnd < 0) {
                return str;
            }
            index = methodEnd + 1;
            continue;
        }

        // for objects
        if (str.charAt(stringOpening) === '{') {
            let objectEnd = findClosingBracket(str, stringOpening + 1);
            if (objectEnd < 0) {
                return str;
            }

            let replacedObject = addQuotes(str.slice(stringOpening, objectEnd + 1));
            str = `${str.slice(0, stringOpening)}${replacedObject}${str.slice(objectEnd + 1)}`;

            index += stringOpening + replacedObject.length + 1;

            continue;
        }

        str = `${str.slice(0, stringOpening)}'${str.slice(stringOpening, stringClosing + 1)}'${str.slice(stringClosing + 1)}`;
        index = stringClosing + 3;
    }

    return str;
}

String.prototype.indexOfCode = function (pattern, startIndex = 0, withRegex = true) {
    let closeSymbol;
    const quoteRegex = /['"\/`]/;
    let k = 0;
    const patternLength = pattern.length;
    for (let i = startIndex, n = this.length; i < n; i++) {
        if (closeSymbol) {
            if (this.charAt(i) === closeSymbol && !/\\/.test(this.charAt(i - 1))) {
                closeSymbol = null;
            }
        } else {
            if (this.charAt(i) === pattern.charAt(k++)) {
                if (k === patternLength) {
                    return i - patternLength + 1;
                }
            } else {
                k = 0;
                if (quoteRegex.test(this.charAt(i))) {
                    closeSymbol = this.charAt(i);
                }
            }
        }
    }

    return -1;
};

String.prototype.splitLines = function () {
    let insideString = false;
    let stringEndSymbol;
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

    return id.split("").reverse().join("");
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

function getClassMap(content, startIndex) {
    let classDeclarations = [];
    let classMap = {};
    let start = content.indexOfCode('class ', startIndex);
    while (start >= 0) {
        let openBracket = content.indexOfCode('{', start);
        if (openBracket < 0) {
            let [line, column] = calculateLineColumn(content, start);
            throw {
                message: 'Missing { for class definition',
                line,
                column: [column, column + 5],
                index: start,
                classMap
            };
        }

        if (!/[a-z\d\s>]/i.test(content.slice(start, openBracket - 1))) {
            let [line1, column1] = calculateLineColumn(content, start);
            let [line2, column2] = calculateLineColumn(content, openBracket);
            throw {
                message: 'Class declaration is invalid',
                line: line1 === line2 ? line1 : [line1, line2],
                column: [column1, column2],
                index: openBracket,
                classMap
            };
        }

        let closingBracket = findClosingBracket(content, openBracket);
        if (closingBracket < 0) {
            let [line, column] = calculateLineColumn(content, start);
            throw {
                message: 'Missing { for class definition',
                line,
                column: column + 5,
                index: start + 5,
                classMap
            };
        }

        classDeclarations.push(content.slice(start, closingBracket + 1));
        start = content.indexOfCode('class ', closingBracket + 1);
    }

    classDeclarations.forEach((classDeclaration) => {
        let firstBracket = classDeclaration.indexOfCode('{');
        let declaration = classDeclaration.slice(0, firstBracket);
        declaration = declaration.replace('class ', '').replace('{', '');
        let hierarchy = declaration.split('>');

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
            methods: {private: {}, protected: {}, public: {}}
        };

        let properties = [];
        let property;
        try {
            property = parseProperty(classDeclaration, firstBracket);
        } catch (e) {
            Object.assign(e, {classMap});
            throw e;
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
            if (property.type === 'variable' || property.type === 'method') {
                classMap[className][typeMap[property.type]][property.access][property.name] = property.value;
            } else {
                classMap[className][typeMap[property.type]][property.name] = property.value;
            }

            property = parseProperty(classDeclaration, property.index + 2);
        }
    });

    return classMap;
}

function parseProperty(content, index) {
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
        let [line2, column2] = calculateLineColumn(content, nameEnd);
        throw {
            message: `Invalid property name '${name}'`,
            line,
            column: [column1, column2],
            index: nameEnd,
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

        value = {parameters, body};
        index = bodyEnd + 1;
    } else if (afterName[0] === '{') {
        let bodyStart = content.indexOfCode('{', nameEnd + 1);
        let bodyEnd = findClosingBracket(content, bodyStart);
        let body = content.slice(bodyStart, bodyEnd + 1);
        index = bodyEnd + 1;
        value = body;
    } else if (afterName[0] === `'`) {
        let nextColon = content.indexOfCode(';', nameEnd + 1);
        while (content[nextColon - 1] === '\\') {
            nextColon = content.indexOfCode(';', nextColon + 1);
        }

        nameEnd++;
        while ([`'`, ' '].includes(content.charAt(nameEnd))) {
            nameEnd++;
        }
        nextColon--;
        while ([`'`, ' '].includes(content.charAt(nextColon))) {
            nextColon--;
        }

        value = content.slice(nameEnd, nextColon + 1).trim();
        type = 'variable';
        index = nextColon;
    } else {
        let [line, column] = calculateLineColumn(content, nameEnd + 1);
        throw {
            message: `Variable value is incorrect. Should be function, object or string`,
            line,
            column,
            index: nameEnd + 1,
            classMap
        };
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

    if (cssProperties[name] === 1) {
        type = 'css';
    }

    return {
        name, type, access, value, index
    }
}

function getNextChild(content, index = 0) {
    let elementIndex = content.regexIndexOf(/[.a-zA-Z_\d]+/, index);
    let openingBracket = content.indexOfCode('{', elementIndex);
    let semiColon = content.indexOfCode(';', elementIndex);
    let closingBracket = findClosingBracket(content, openingBracket + 1);
    let declaration = content.slice(index, Math.min(openingBracket, semiColon)).trim();
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
        return {start: elementIndex, end: semiColon + 1, name, classes, children, properties};
    }

    let nextChildEnd = openingBracket + 1;
    let nextOpeningBracket = content.indexOfCode('{', nextChildEnd);
    let nextSemiColon = content.indexOfCode(';', nextChildEnd);
    nextOpeningBracket = Math.min(nextOpeningBracket, nextSemiColon);
    let nextColon = content.indexOfCode(':', nextChildEnd);

    while (nextOpeningBracket >= 0 && nextOpeningBracket < closingBracket || nextColon >= 0 && nextColon < closingBracket) {
        if (nextColon < nextOpeningBracket || nextOpeningBracket < 0) {
            let property = parseProperty(content, nextChildEnd + 2);
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
            if (property.type === 'variable' || property.type === 'method') {
                properties[typeMap[property.type]][property.access][property.name] = property.value;
            } else {
                properties[typeMap[property.type]][property.name] = property.value;
            }
            nextChildEnd = property.index + 1;
        } else {
            let nextChild = getNextChild(content, nextChildEnd);
            nextChildEnd = nextChild.end + 1;
            children.push(nextChild);
        }

        nextOpeningBracket = content.indexOfCode('{', nextChildEnd);
        nextColon = content.indexOfCode(':', nextChildEnd);
        nextSemiColon = content.indexOfCode(';', nextChildEnd);
        nextOpeningBracket = Math.min(nextOpeningBracket, nextSemiColon);
    }

    return {start: elementIndex, end: closingBracket + 1, name, classes, children, properties};
}

module.exports = {
    addQuotes,
    findClosingBracket,
    nextID,
    getClassMap,
    getNextChild,
    calculateLineColumn
};