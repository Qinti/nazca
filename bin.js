#! /usr/bin/env node
/**
 * Main CLI script. Compiles, Initializes, Analyses the files.
 * @author Q'inti qinti.nazca@gmail.com
 */

const fs = require('fs');

if (process.argv.length < 3) {
    require('./src/compile');
} else if (process.argv.length === 3 && ['init', 'help'].includes(process.argv[2])) {
    if (process.argv[2] === 'init') {
        init();
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
    console.log('4. Show the usage info');
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
        'th', 'th', 'th', 'th', 'st', 'nd', 'rd', , 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'];
    day = `${day}${dayTermination[day]}`;
    let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
        "November", "December"][currentTime.getMonth()];
    let year = currentTime.getFullYear();

    function addLeadZero(number) {
        return `${number < 10 ? '0' : ''}${number}`;
    }

    const defaultNazcaConfig = `
/**
 * This is a sample .nazca file generated by ${process.env.USERNAME} at ${hours}:${minutes}:${seconds} on ${day} of ${month} ${year}
 * It is a json file with block and a line comments
 */
{
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
    }
}
`;

    fs.writeFile('.nazca', defaultNazcaConfig, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('.nazca is initialized');
        }
    });
}