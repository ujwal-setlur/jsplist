#!/usr/bin/env node
/**
  This implements a simple property list (plist) editor in JavaScript.
  Author: Ujwal S. Setlur
  License: MIT
  Copyright 2017
**/

"use strict";

let fs = require("fs");
let plist = require("plist");
let program = require("commander");
let chalk = require("chalk");
let _ = require("lodash");

let theFile;
let theFileBuffer;
let theObject;
let supportedFormats = ["json", "plist"];

program
  .arguments("<file>")
  .option("-g, --get <get>", "Get value of comma delimited (for nested) property name")
  .option("-s, --set <set>", "Set value of comma delimited (for nested) property name")
  .option("-v, --value <value>", "The value to set for entry in JSON notation")
  .option("-f, --format <format>", "The output format: plist/json, default plist")
  .action(function(file) {
    theFile = file;
  })
  .parse(process.argv);

if (!theFile) {
  console.error(chalk.red("jsplist: missing file argument"));
  process.exit(1); // eslint-disable-line no-process-exit
}

if (program.set && program.get) {
  console.error(chalk.red("jsplist: get and set operations cannot be used together"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (program.get && program.value) {
  console.error(chalk.red("jsplist: value can be used with set operation only"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (program.get && program.format) {
  console.error(chalk.red("jsplist: format cannot be used with get operation"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (program.set && !program.value) {
  console.error(chalk.red("jsplist: missing value argument"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (!program.set && program.value) {
  console.error(chalk.red("jsplist: missing argument"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (program.format && !supportedFormats.includes(program.format)) {
  console.error(chalk.red("jsplist: unsupported output format " + program.format));
  process.exit(1); // eslint-disable-line no-process-exit
}

// Read in the file
try {
  theFileBuffer = fs.readFileSync(theFile, "utf8");
} catch (e) {
  console.error(chalk.red("jsplist:", e));
  process.exit(1); // eslint-disable-line no-process-exit
}

// Parse the file. Try plist format first, then json
try {
  theObject = plist.parse(theFileBuffer);
} catch (plistException) {
  // try json
  try {
    theObject = JSON.parse(theFileBuffer);
  } catch (jsonException) {
    console.error(chalk.red("jsplist: error parsing file, tried both plist and json"));
    console.error(chalk.red("jsplist:", plistException));
    console.error(chalk.red("jsplist:", jsonException));
    process.exit(1); // eslint-disable-line no-process-exit
  }
}

// Process the file
if (program.get) {
  try {
    // Split the accessor string into an array
    let accessorArray = program.get.split(",").map(function(item) {
      return item.trim();
    });
    // Get the value!
    let theValue = _.get(theObject, accessorArray);
    if (theValue) {
      console.log(theValue);
    }
  } catch (e) {
    console.error(chalk.red("jsplist:", e));
    process.exit(1); // eslint-disable-line no-process-exit
  }
} else if (program.set) {
  try {
    // Split the accessor string into an array
    let accessorArray = program.set.split(",").map(function(item) {
      return item.trim();
    });
    // Parse the value into JSON
    let theValue = JSON.parse(program.value);
    // Set the value!
    _.set(theObject, accessorArray, theValue);
    // Output the new file
    outputFile(theObject, program.format);
  } catch (e) {
    console.error(chalk.red("jsplist:", e));
    process.exit(1); // eslint-disable-line no-process-exit
  }
} else {
  // Just output the file
  outputFile(theObject, program.format);
}

function outputFile(obj, format) {
  if (!format) {
    format = "plist";
  }
  if (format === "plist") {
    console.log(plist.build(obj));
  } else {
    console.log(JSON.stringify(obj, null, 2));
  }
}


