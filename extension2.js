// import * as vscode from 'vscode';
var vscode = require('vscode');

//to store sb items
var sbVars = {};
var sbVarscounter = 0;

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
      console.log(distinct_lines);
      console.log(duplicate_lines);

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
        // warnMsg('List has not duplicates', counter);
        duplicate_lines.length = 0;
      } else if (duplicate_lines.length > 0 && distinct_lines.length > 0) {
        editor.edit(function (editBuilder) {
          editBuilder.replace(selection, distinct_lines.join('\n'));
        });
        var counter = {
          distinct: distinct_lines,
          duplicate: duplicate_lines,
        };

        // infoMsg( 'Duplicates removed', counter);
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

        infoMsg('Lines shuffled');
      } else {
        warnMsg("List wasn't shuffled");
      }
    }
  );

  context.subscriptions.push(disposableremDuplicates);
  context.subscriptions.push(disposableShuffle);
}
exports.activate = activate;

// this method is called when your extension is deactivated
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
  return '123';
  // const parameters = [...arguments];

  // parameters.forEach((param, index) => {
  //   console.log('Parameter ' + (index + 1) + ': ' + param);
  // });

  for (var key in counter) {
    if (key == 'distinct') {
      //length of lines
      value = counter[key];
      distinct_counter = parseInt(value.length);
      //letters count
      for (var i = 0; i < value.length; i++) {
        var currentString = value[i];

        // Count the number of letters in the current string
        for (var j = 0; j < currentString.length; j++) {
          // Check if the character is a letter (assuming only alphabetic characters)
          if (currentString[j].match(/[a-zA-Z]/)) {
            letters_counter++;
          }
        }

        // console.log(key + ': ' + parseInt(counter[key].length));
      }
    }
    if (key == 'duplicate') {
      duplicate_counter = counter[key].length;
      // console.log(key + ': ' + counter[key]);
    }
  }
  // //distinct lines
  console.log(
    chgStatusBarItem(
      'barDistinct',
      'statusBarItem.errorBackground',
      distinct_counter
    )
  );
  // barDistinct = vscode.window.createStatusBarItem(
  //   vscode.StatusBarAlignment.Left
  // );
  // barDistinct.text = `$(selection) ${distinct_counter}`;
  // barDistinct.tooltip = 'Lines count';
  // barDistinct.backgroundColor = new vscode.ThemeColor(
  //   'statusBarItem.errorBackground'
  // );
  // barDistinct.show();

  // //Duplicates count
  // chgStatusBarItem(
  //   'barDuplicate',
  //   'statusBarItem.errorBackground',
  //   duplicate_counter
  // );
  // barDuplicate = vscode.window.createStatusBarItem(
  //   vscode.StatusBarAlignment.Left
  // );
  // barDuplicate.text = `$(files) ${duplicate_counter}`;
  // barDuplicate.tooltip = 'Duplicates count';
  // barDuplicate.backgroundColor = new vscode.ThemeColor(
  //   'statusBarItem.errorBackground'
  // );
  // barDuplicate.show();

  //letters
  // chgStatusBarItem(
  //   'barLetters',
  //   'statusBarItem.errorBackground',
  //   letters_counter
  // );
  // const barLetters = vscode.window.createStatusBarItem(
  //   vscode.StatusBarAlignment.Left
  // );
  // if (barLetters) {
  //   barLetters.text = `$(files) ${letters_counter}`;
  //   barLetters.tooltip = 'Letters count';
  //   barLetters.backgroundColor = new vscode.ThemeColor(
  //     'statusBarItem.errorBackground'
  //   );
  //   barLetters.show();
  // }
}
//counter helpers
function chgStatusBarItem(sb_name, color, count_numb) {
  return 'sbVars';
  // sb_name.hide();
  // if (!sbVars.hasOwnProperty(sb_name)) {
  //   sbVars[sb_name] = 'New Value';
  //   console.log(sbVars[sb_name]);
  // } else {
  //   sbVars[sb_name] = '1';
  //   console.log(sbVars[sb_name]);
  // }
  // if (typeof sb_name === 'undefined') {
  //   sb_name = 1;
  //   console.log('ne');
  //   console.log(sb_name);
  // } else {
  //   console.log(sb_name);
  // }
  if (!sbVars.hasOwnProperty(sb_name)) {
    sbVars[sb_name] = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    console.log('ne');
    // context.globalState.update(sb_name, sb_name_val);
  } else {
    console.log('yes');
    sbVars[sb_name].text = `$(files) ${count_numb}`;
    sbVars[sb_name].tooltip = 'Letters count';
    sbVars[sb_name].backgroundColor = new vscode.ThemeColor(color);
    sbVars[sb_name].show();
  }
}

// vscode helpers
function infoMsg(vscode, msg, counter = '') {
  // if (!sbVars.hasOwnProperty('sb_name')) {
  //   sbVars['sb_name'] = vscode.window.createStatusBarItem(
  //     vscode.StatusBarAlignment.Left
  //   );
  //   sbVars['sb_name'].text = `$(files) ${sbVarscounter}`;
  //   sbVars['sb_name'].tooltip = 'Letters count';
  //   sbVars['sb_name'].backgroundColor = new vscode.ThemeColor(
  //     'statusBarItem.errorBackground'
  //   );
  //   sbVars['sb_name'].show();
  // }
  // if (sbVars.hasOwnProperty('sb_name')) {
  //   sbVarscounter += 1;
  //   sbVars['sb_name'].text = `$(files) ${sbVarscounter}`;
  //   sbVars['sb_name'].show();
  //   // context.globalState.update(sb_name, sb_name_val);
  // }
  //  else {
  //   var temp_sbitem = sbVars[sb_name];
  //   // console.log(temp_sbitem);
  //   temp_sbitem.text = `$(files) ${count_numb}`;
  //   temp_sbitem.tooltip = 'Letters count';
  //   temp_sbitem.backgroundColor = new vscode.ThemeColor(color);
  //   temp_sbitem.show();
  // }
  // const parameters = [...arguments];

  // parameters.forEach((param, index) => {
  //   console.log('Parameter ' + (index + 1) + ': ' + param);
  // });
  console.log(countStatusBarItem(vscode, counter));
  vscode.window.showInformationMessage(msg);
}
function warnMsg(msg) {
  // sbVars['sb_name'] = 1;
  // console.log(sbVars);
  // countStatusBarItem(counter);
  vscode.window.showWarningMessage(msg);
}
