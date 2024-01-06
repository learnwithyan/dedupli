// import * as vscode from 'vscode';
var vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const { localize } = require('vscode-nls');

//extId
var extId = 'learnwithyan.dedupli';
//for localization commands
// var localizeCmds = require('vscode-nls').loadMessageBundle();
// const nls = require('vscode-nls');
// const localizeVars = nls.loadMessageBundle();
var localizeVars = require('vscode-nls').loadMessageBundle();

//path of ext
var extensionPath = vscode.extensions.getExtension(extId).extensionPath;

//to store sb items
var sbVars = {};

function activate(context) {
  //get user lng
  var language = vscode.env.language;
  console.log(language);
  // const localizeExtension = localize('dedupli.remDuplicates');
  // console.log(localizeExtension);
  //get user lng json for variables
  localizeVars.translations = require(`./translations/${language}/${language}.json`);

  //trnsl readme file but not automatically it open a window just
  // trnslReadme(vscode, language);

  //get all nls files
  var lnsFileJSON = getNlsFile(vscode, language);
  const remDuplicatesCmd = lnsFileJSON['dedupli.remDuplicates'];

  var disposableremDuplicates = vscode.commands.registerCommand(
    'dedupli.remDuplicates',
    function () {
      vscode.window.showInformationMessage(remDuplicatesCmd);

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
  const distinctLinesCounter =
    localizeVars.translations['distinctLinesCounter'];
  const duplicatedLinesCounter =
    localizeVars.translations['duplicatedLinesCounter'];
  const symbolsLinesCounter = localizeVars.translations['symbolsLinesCounter'];

  chgStatusBarItem(
    vscode,
    'barDistinct',
    distinctLinesCounter,
    'statusBarItem.errorBackground',
    'snake',
    distinct_counter
  );

  chgStatusBarItem(
    vscode,
    'barDuplicate',
    duplicatedLinesCounter,
    'statusBarItem.warningBackground',
    'files',
    duplicate_counter
  );

  chgStatusBarItem(
    vscode,
    'barLetters',
    symbolsLinesCounter,
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

// ext helpers
function infoMsg(vscode, msg, counter = '') {
  countStatusBarItem(vscode, counter);
  vscode.window.showInformationMessage(msg);
}
function warnMsg(vscode, msg, counter = '') {
  countStatusBarItem(vscode, counter);
  vscode.window.showWarningMessage(msg);
}
//translate readme
function trnslReadme(vscode, language) {
  const translationsPath = path.join(
    extensionPath,
    'translations',
    language,
    'README.md'
  );
  const defaultPath = path.join(extensionPath, 'README.md');

  let readmeContent;

  try {
    readmeContent = fs.readFileSync(translationsPath, 'utf8');
    console.log(readmeContent);
  } catch (error) {
    // Fallback to the default README.md if translation not available
    readmeContent = fs.readFileSync(defaultPath, 'utf8');
  }
  //update readme
  const panel = vscode.window.createWebviewPanel(
    'translatedReadme',
    'Translated README',
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );
  const htmlContent = fs.readFileSync(
    path.join(__dirname, '/translations/translreadme.html')
  );

  // Replace a placeholder in the HTML content with the dynamic value
  const finalHtml = htmlContent
    .toString()
    .replace('{{translatedReadme}}', readmeContent);

  // Set the HTML content in the webview panel
  panel.webview.html = finalHtml;
}

//get LNS
function getNlsFile(vscode, languageCode) {
  const localizeCmds =
    vscode.extensions.getExtension(extId).packageJSON.localize;

  for (const matchingFile of localizeCmds) {
    if (matchingFile.includes(languageCode)) {
      try {
        // Read the content of the matching file as JSON
        var pathnls = path.join(__dirname, '/', matchingFile);
        var content = fs.readFileSync(pathnls, 'utf8');
        const jsonContent = JSON.parse(content);
        return jsonContent;
      } catch (error) {
        console.error(
          `Error reading or parsing ${matchingFile} as JSON:`,
          error.message
        );
      }
    }
  }
  return null; // If no matching file is found
}
