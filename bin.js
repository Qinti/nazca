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
        console.log('init');
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