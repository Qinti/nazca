#! /usr/bin/env node
/**
 * Main CLI script. Compiles, Initializes, Analyses the files.
 * @author Q'inti qinti.nazca@gmail.com
 */

const fs = require('fs');

if (process.argv.length < 3) {
    const compile = require('./src/compile').compileAll;

    compile();
} else if (process.argv.length === 3 && ['init', 'help', 'watch'].includes(process.argv[2])) {
    if (process.argv[2] === 'init') {
        init();
    } else if (process.argv[2] === 'watch') {
        const compileFile = require('./src/compile').compile;
        const compile = require('./src/compile').compileAll;

        const tools = require('./src/tools');
        let includes = {};
        let reverseNames = {};
        console.log('Watching the files:');
        fs.readFile('.nazca', (err, content) => {
            if (err) {
                return console.error('No .nazca file is found');
            }

            content = tools.flattenNazcaConfig(content.toString());

            let config = JSON.parse(content);
            let sources = config.sources;
            let sourceFiles = Object.keys(sources).map((key) => sources[key]);

            for (let source in sources) {
                reverseNames[sources[source]] = source;
            }

            let filesToWatch = [];
            sourceFiles.forEach((file) => {
                filesToWatch.push(file);
                let includedFiles = tools.findIncludesRecursively(file);
                filesToWatch = filesToWatch.concat(includedFiles);

                includedFiles.forEach((iFile) => {
                    includes[iFile] = includes[iFile] || [];
                    includes[iFile].push(file);
                });
            });

            for (let key in includes) {
                includes[key] = includes[key].filter((value, index, self) => self.indexOf(value) === index);
            }

            filesToWatch = filesToWatch.filter((value, index, self) => {
                return self.indexOf(value) === index;
            });

            filesToWatch.forEach((file) => {
                console.log(file);
                fs.watchFile(file, async () => {
                    console.log(`${file} is changed. Recompiling...`);
                    if (includes[file]) {
                        for (let i = 0, n = includes[file].length; i < n; i++) {
                            let include = includes[file][i];
                            await compileFile(include, reverseNames[include], config.out, config.beautify);
                        }
                    } else {
                        await compileFile(file, reverseNames[file], config.out, config.beautify);
                    }
                });
            });

            console.log();
            compile();
        });
    } else if (process.argv[2] === 'help') {
        help();
    }
} else if ((process.argv.length === 4 && ['analyse', 'analyze'].includes(process.argv[2]))) {
    let file = process.argv[3];
    if (!fs.existsSync(file)) {
        require('./src/compile');
    } else {
        require('./src/analyse').analyseFile(file);
    }
} else {
    console.log('nazca usage is invalid');
    help();
}

function help() {
    console.log('Usage:');
    console.log();
    console.log('1. Compile .nazca project');
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│> cd /path/to/the/folder/with/.nazca/file                   │');
    console.log('│> nazca                                                     │');
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log();
    console.log('2. Analyse the *.nazca file for the correct syntax');
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│> nazca analyse /path/to/file.nazca                         │');
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log();
    console.log('3. Generate .nasca file');
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│> cd /folder/where/you/want/to/init/the/project             │');
    console.log('│> nazca init                                                │');
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log();
    console.log('4. Watch the files and compile the project if any file in .nazca config changes');
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│> cd /folder/where/you/want/to/init/the/project             │');
    console.log('│> nazca watch                                               │');
    console.log('└────────────────────────────────────────────────────────────┘');
    console.log();
    console.log('5. Show the usage info');
    console.log('┌────────────────────────────────────────────────────────────┐');
    console.log('│> nazca help                                                │');
    console.log('└────────────────────────────────────────────────────────────┘');
}

function init() {
    // To avoid the moment.js dependency, we are doing all time calculations manually.
    let currentTime = new Date();
    let hours = addLeadZero(currentTime.getHours());
    let minutes = addLeadZero(currentTime.getMinutes());
    let seconds = addLeadZero(currentTime.getSeconds());

    let day = currentTime.getDate();
    const dayTermination = ['st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
        'th', 'th', 'th', 'th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'];
    day = `${day}${dayTermination[day]}`;
    let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
        "November", "December"][currentTime.getMonth()];
    let year = currentTime.getFullYear();

    function addLeadZero(number) {
        return `${number < 10 ? '0' : ''}${number}`;
    }

    let name = process.cwd().split(/\/|\\/).pop();

    const defaultNazcaConfig = `
/**
 * This is a sample .nazca file generated by ${process.env.USERNAME} at ${hours}:${minutes}:${seconds} on ${day} of ${month} ${year}
 * It is a json file with block and a line comments
 */
{
    "name": "${name}",
    /*
        "sources" shows what nazca files correspond to what css/html/js in form of
        "fileName": "path/to/nazca/file.nazca"
        It will generate fileName.html, fileName.css and fileName.js files.
    */
    "sources": {
        "index": "nazca/index.nazca"
    },
    /*
        "out" shows the folders, where the css/html/js should be generated
    */
    "out": {
        "path": "www",  // main folder path to output the files
        "css": "css",   // path to the css folder. All css files will be generated in 'path/css' folder
        "html": ".",    // path to the html folder. All html files will be generated in 'path/html' folder
        "js": "js"     // path to the js folder. All js files will be generated in 'path/js' folder
    },
    "beautify": 0 // -1 - uglify the JS, 0 - do not change, 1 - beautify the JS
}
`;

    let indexNazca = `
.html {
    .head {
        .title {
            text: Welcome to the world of Nazca;
        };
    };
    
    .body {
        font-size: 13pt;
        
        .div {
            width: 300px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 5px double #aaa;
            padding: 10px;
            text-align: center;

            .img {
                width: 100%;
                $src: https://raw.githubusercontent.com/Qinti/nazca/master/logo/NazcaLogo.png;
            };
            
            .div {
                html: The project is initialized, but is not functional yet.<br>Come back later!;
            };
            .div {
                text-align: right;
                padding-top: 35px;
                font-size: 9pt;
    
                text: Powered by;
                .a {
                    color: #38742e;
                    font-weight: bold;

                    text: Nazca;
                    $href: https://github.com/Qinti/nazca;
                };
            };
        };
    };
};
`;
    fs.writeFile('.nazca', defaultNazcaConfig, (err) => {
        if (err) {
            return console.error(err);
        }

        fs.mkdir('nazca', (err) => {
            if (err && err.code !== 'EEXIST') {
                return console.error(err);
            }

            fs.writeFile('.nazca', defaultNazcaConfig, (err) => {
                if (err) {
                    return console.error(err);
                }

                fs.writeFile('nazca/index.nazca', indexNazca, (err) => {
                    if (err) {
                        return console.error(err);
                    }

                    console.log('.nazca is initialized');
                });
            });
        });
    });
}
