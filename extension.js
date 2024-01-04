// import * as vscode from 'vscode';
var vscode = require('vscode');

//to store sb items
var sbVars = {};

function activate(context) {
  // let uri = vscode.window.activeTextEditor.document.uri;
  // let config = vscode.workspace.getConfiguration('extension', uri);

  // let inspect = config.inspect('lineBreak');

  // console.log('inspect.key:', inspect.key);
  // console.log('inspect.defaultValue:', inspect.defaultValue);
  // console.log('inspect.globalValue:', inspect.globalValue);
  // console.log('inspect.workspaceValue:', inspect.workspaceValue);
  // console.log('inspect.workspaceFolderValue:', inspect.workspaceFolderValue);
  // return;

  // var lineBreak = config.get('lineBreak');
  var disposableremDuplicates = vscode.commands.registerCommand(
    'dedupli.remDuplicates',
    function () {
      var editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
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
        infoMsg(vscode, 'Duplicates removed', counter);
        distinct_lines.length = 0;
      } else if (distinct_lines.length > 0 && duplicate_lines.length == 0) {
        var counter = {
          distinct: distinct_lines,
        };
        warnMsg(vscode, 'List has not duplicates', counter);
        duplicate_lines.length = 0;
      } else if (duplicate_lines.length > 0 && distinct_lines.length > 0) {
        editor.edit(function (editBuilder) {
          editBuilder.replace(selection, distinct_lines.join('\n'));
        });
        var counter = {
          distinct: distinct_lines,
          duplicate: duplicate_lines,
        };

        infoMsg(vscode, 'Duplicates removed', counter);
        distinct_lines.length = 0;
        duplicate_lines.length = 0;
      }
    }
  );

  var disposableShuffle = vscode.commands.registerCommand(
    'dedupli.shuffle',
    function () {
      var editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No open text editor
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

        infoMsg(vscode, 'Lines shuffled');
      } else {
        warnMsg(vscode, "List wasn't shuffled");
      }
    }
  );

  context.subscriptions.push(disposableremDuplicates);
  context.subscriptions.push(disposableShuffle);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

// function helpers
function randomizeArrayOrder(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temporaryValue = array[i];
    array[i] = array[j];
    array[j] = temporaryValue;
  }
  return array;
}
//counters
function countStatusBarItem(vscode, counter) {
  var distinct_counter = 0;
  var duplicate_counter = 0;
  var letters_counter = 0;
  for (var key in counter) {
    if (key == 'distinct') {
      //length of lines
      let value = counter[key];
      distinct_counter = parseInt(value.length);
      //letters count
      for (var i = 0; i < parseInt(value.length); i++) {
        var currentString = value[i];
        // Count the number of letters in the current string
        for (var j = 0; j < currentString.length; j++) {
          // Check if the character is a letter (assuming only alphabetic characters)
          if (currentString[j].match(/[a-zA-Z0-9]/)) {
            letters_counter++;
          }
        }
      }
    }
    if (key == 'duplicate') {
      duplicate_counter = counter[key].length;
    }
  }
  chgStatusBarItem(
    vscode,
    'barDistinct',
    'Distinct lines counter',
    'statusBarItem.errorBackground',
    'snake',
    distinct_counter
  );

  chgStatusBarItem(
    vscode,
    'barDuplicate',
    'Duplicated lines counter',
    'statusBarItem.errorBackground',
    'files',
    duplicate_counter
  );

  chgStatusBarItem(
    vscode,
    'barLetters',
    'Letters lines counter',
    'statusBarItem.errorBackground',
    'text-size',
    letters_counter
  );
}
//counter helpers
function chgStatusBarItem(vscode, sb_name, desc, color, icon, count_numb) {
  if (!sbVars.hasOwnProperty(sb_name)) {
    sbVars[sb_name] = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
  }
  sbVars[sb_name].text = `$(${icon}) ${count_numb}`;
  sbVars[sb_name].tooltip = desc;
  sbVars[sb_name].backgroundColor = new vscode.ThemeColor(color);
  sbVars[sb_name].show();
}

// vscode helpers
function infoMsg(vscode, msg, counter = '') {
  countStatusBarItem(vscode, counter);
  vscode.window.showInformationMessage(msg);
}
function warnMsg(vscode, msg, counter = '') {
  countStatusBarItem(vscode, counter);
  vscode.window.showWarningMessage(msg);
}
