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
let theObject;

program
  .arguments("<file>")
  .option("-g, --get <get>", "Get value of comma delimited (for nested) property name")
  .option("-s, --set <set>", "Set value of comma delimited (for nested) property name")
  .option("-v, --value <value>", "The value to set for entry in JSON notation")
  .action(function(file) {
    theFile = file;
  })
  .parse(process.argv);

if (!theFile) {
  console.error(chalk.red("jsplistutil: missing file argument"));
  process.exit(1); // eslint-disable-line no-process-exit
}

if (program.set && program.get) {
  console.error(chalk.red("jsplistutil: get and set operations cannot be used together"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (program.get && program.value) {
  console.error(chalk.red("jsplistutil: value can be used with set operation only"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (program.set && !program.value) {
  console.error(chalk.red("jsplistutil: missing value argument"));
  process.exit(1); // eslint-disable-line no-process-exit
}
if (!program.set && program.value) {
  console.error(chalk.red("jsplistutil: missing argument"));
  process.exit(1); // eslint-disable-line no-process-exit
}

// Parse the file
try {
  theObject = plist.parse(fs.readFileSync(theFile, "utf8"));
} catch (e) {
  console.error(chalk.red("jsplistutil:", e));
  process.exit(1); // eslint-disable-line no-process-exit
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
    console.error(chalk.red("jsplistutil:", e));
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
    console.log(plist.build(theObject));
  } catch (e) {
    console.error(chalk.red("jsplistutil:", e));
    process.exit(1); // eslint-disable-line no-process-exit
  }
} else {
  // Just output the file
  console.log(plist.build(theObject));
}


