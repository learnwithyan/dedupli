var vscode = require('vscode');
const fs = require('fs');
const path = require('path'); // Import the 'path' module

const extFuncs = require('./files/funcs.js');

//path
var extId = 'learnwithyan.dedupli';
//path of ext
var extensionPath = vscode.extensions.getExtension(extId).extensionPath;

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('dedupli.com1', function () {
      extFuncs.trnslReadmeHandler();
    }),
    vscode.commands.registerCommand('dedupli.com2', function () {
      remDuplicatesHandler();
    }),
    vscode.commands.registerCommand('dedupli.com3', function () {
      shuffleHandler();
    }),
    vscode.commands.registerCommand('dedupli.com4', function () {
      base64Handler();
    }),
    vscode.commands.registerCommand('dedupli.com5', function () {
      emptyLinesHandler();
    })
  );
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

// function helpers
//remove empty lines
function emptyLinesHandler() {
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  var selection = editor.selection;
  var text = editor.document.getText(selection);
  var lines = text.split('\n');

  // Remove empty lines
  var nonEmptyLines = lines.filter((line) => line.trim() !== '');

  // Join the non-empty lines back into a single string
  var updatedText = nonEmptyLines.join('\n');

  // Replace the selected text with the updated text
  editor.edit((editBuilder) => {
    editBuilder.replace(selection, updatedText);
    extFuncs.infoMsg(vscode, 'Empty lines were deleted');
  });
}

//base64
function base64Handler() {
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  var selection = editor.selection;
  var text = editor.document.getText(selection);
  var lines = text.split('\n');

  if (lines[lines.length - 1] === '\n') {
    lines.pop();
  }

  var base64_lines = base64ArrayOrder(lines);
  if (typeof base64_lines !== 'undefined' && base64_lines.length > 0) {
    editor.edit(function (editBuilder) {
      editBuilder.replace(selection, base64_lines.join('\n'));
    });
    extFuncs.infoMsg(vscode, 'Lines converted to base64');
  } else {
    extFuncs.warnMsg(vscode, 'Lines were NOT converted to base64');
  }
}

function base64ArrayOrder(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(btoa(arr[i]));
  }
  return result;
}
//shuffle lines
function shuffleHandler() {
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  var selection = editor.selection;
  var text = editor.document.getText(selection);
  var lines = text.split('\n');

  if (lines[lines.length - 1] === '\n') {
    lines.pop();
  }

  var random_lines = randomizeArrayOrder(lines);
  if (typeof random_lines !== 'undefined' && random_lines.length > 0) {
    editor.edit(function (editBuilder) {
      editBuilder.replace(selection, random_lines.join('\n'));
    });

    extFuncs.infoMsg(vscode, 'Lines shuffled');
  } else {
    extFuncs.warnMsg(vscode, "List wasn't shuffled");
  }
}

//rem duplicates
function remDuplicatesHandler() {
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  var selection = editor.selection;
  var text = editor.document.getText(selection);
  var lines = text.split('\n');

  var distinct_lines = [];
  var duplicate_lines = [];

  lines.forEach(function (el) {
    if (distinct_lines.indexOf(el) === -1) {
      distinct_lines.push(el);
    } else {
      duplicate_lines.push(el);
    }
  });

  if (duplicate_lines.length > 0 && distinct_lines.length == 0) {
    editor.edit(function (editBuilder) {
      editBuilder.replace(selection, distinct_lines.join('\n'));
    });
    var counter = {
      distinct: distinct_lines,
      duplicate: duplicate_lines,
    };
    extFuncs.infoMsg(vscode, 'Duplicates removed', counter);

    distinct_lines.length = 0;
  } else if (distinct_lines.length > 0 && duplicate_lines.length == 0) {
    var counter = {
      distinct: distinct_lines,
    };
    extFuncs.warnMsg(vscode, 'List has not duplicates', counter);
    duplicate_lines.length = 0;
  } else if (duplicate_lines.length > 0 && distinct_lines.length > 0) {
    editor.edit(function (editBuilder) {
      editBuilder.replace(selection, distinct_lines.join('\n'));
    });
    var counter = {
      distinct: distinct_lines,
      duplicate: duplicate_lines,
    };
    extFuncs.infoMsg(vscode, 'Duplicates removed', counter);

    distinct_lines.length = 0;
    duplicate_lines.length = 0;
  }
}
function randomizeArrayOrder(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temporaryValue = array[i];
    array[i] = array[j];
    array[j] = temporaryValue;
  }
  return array;
}
