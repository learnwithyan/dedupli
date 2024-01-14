var vscode = require('vscode');
const fs = require('fs');
const path = require('path');

//extId
var extId = 'learnwithyan.dedupli';
//load lib to transl bar items
var localizeVars = require('vscode-nls').loadMessageBundle();

//path of ext
var extensionPath = vscode.extensions.getExtension(extId).extensionPath;
//to store sb items
var sbVars = {};

function activate(context) {
  //get user lng
  var language = vscode.env.language;

  //get user lng json for variables
  localizeVars.translations = require(`./translations/${language}/${language}.json`);

  //trnsl readme file but not automatically it open a window just

  //get all nls files
  // var lnsFileJSON = getNlsFile(vscode, language);

  //translate readme
  var disposableTranslatedReadme = vscode.commands.registerCommand(
    'dedupli.showTranslReadme',
    // trnslReadme(vscode, language)
    function () {
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
      } catch (error) {
        readmeContent = fs.readFileSync(defaultPath, 'utf8');
      }
      //convert text to html
      readmeContentObj = markdownToObject(readmeContent);
      let htmlCode = '<div id="main">';
      //read texts
      const entriesText = Object.entries(readmeContentObj.texts);
      entriesText.forEach(function ([key, value], i) {
        if (i == 0) {
          htmlCode = htmlCode + key + value;
        } else if (i > 0) {
          htmlCode = htmlCode + key + value;
        }
        return htmlCode;
      });
      //add demo image
      // htmlCode =
      //   htmlCode + '<img src="' + `./translations/${language}/demo.png` + '">';
      const mediaPath = vscode.Uri.file(
        // path.join(context.extensionPath, 'translations', 'ru')
        path.join(__dirname, '/translations')
      ).with({ scheme: 'vscode-resource' });
      // Construct the URI for the image
      const imageUrl = mediaPath.with({
        path: path.join(mediaPath.path, '/demo.gif'),
      });
      htmlCode =
        htmlCode + '<img style="width: 640px;" src="' + imageUrl + '">';
      //read video
      // htmlCode =
      //   htmlCode +
      //   '	<video width="640" height="360" controls><source src="' +
      //   imageUrl +
      //   '" type="video/mp4"></video>';
      // read lists
      const entriesList = Object.entries(readmeContentObj.lists);
      entriesList.forEach(([key, value]) => {
        // console.log(key, value); // Output: key1 value1, key2 value2, key3 value3
        htmlCode = htmlCode + key + value;
      });
      htmlCode = htmlCode + '</div>';
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
        .replace('{{translatedReadme}}', htmlCode);
      // Set the HTML content in the webview panel
      panel.webview.html = finalHtml;
    }
  );
  var disposableremDuplicates = vscode.commands.registerCommand(
    'dedupli.remDuplicates',
    function () {
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

        infoMsg(vscode, 'Lines shuffled');
      } else {
        warnMsg(vscode, "List wasn't shuffled");
      }
    }
  );

  context.subscriptions.push(disposableTranslatedReadme);
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
  //translate bar items
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

//get LNS
function getNlsFile(vscode, languageCode) {
  const localizeCmds =
    vscode.extensions.getExtension(extId).packageJSON.localize;
  for (const matchingFile of localizeCmds) {
    try {
      if (matchingFile.includes(languageCode)) {
        // Read the content of the matching file as JSON
        var pathnls = path.join(__dirname, '/', matchingFile);
      } else {
        var pathnls = path.join(__dirname, '/', 'package.nls.json');
      }
      return pathnls;
    } catch (error) {
      console.error(
        `Error reading or parsing ${matchingFile} as JSON:`,
        error.message
      );
    }
  }
  return null; // If no matching file is found
}

//read markdown text
function markdownToObject(markdownText) {
  const regexblocks = /#(.*?)#/gs;
  const matches = markdownText.match(regexblocks);

  //check for regular text we used first symbol as "- "
  const regexchecktext = /#(.+?)\n\n((?![\-|]).*)/;
  const regexgettext = /#(.+?)\n\n((?![\-|]).*)/;

  //check for list we used first symbol as "- "
  const regexchecklist = /#.+?\n\n*?- /;
  const regexgetlist = /# (.+?)\n\n([\s\S]+?)#/;
  //check for table (not used) we used first symbol as "|"
  const regexchecktable = /#.+?\n\n*?\|/;
  const regexgettable = /# (.+?)\n\n([\s\S]+?)#/;

  let obj = {};

  if (matches) {
    matches.forEach((match) => {
      let block = match.trim();
      if (regexchecklist.test(block) === true) {
        const matchlist = block.match(regexgetlist);
        const matchlistTitle = matchlist[1].trim();
        const matchlistArr = matchlist[2].split('\n- ').map((line) => {
          line = line.replace('- ', '').trim();
          return '<li>' + line.replace(',') + '</li>';
        });
        obj.lists = [];
        obj.lists['<h3>' + matchlistTitle + '</h3>'] =
          '<ul>' + matchlistArr.join(' ') + '</ul>';
      }
      if (regexchecktext.test(block) === true) {
        const matchtext = block.match(regexgettext);
        const matchtextTitle = matchtext[1].trim();
        const matchtextArr = matchtext[2].trim();
        if (obj.hasOwnProperty('texts')) {
          obj.texts['<h2>' + matchtextTitle + '</h2>'] =
            '<p>' + matchtextArr + '</p>';
        } else {
          obj.texts = [];
          obj.texts['<h1>' + matchtextTitle + '</h1>'] =
            '<p>' + matchtextArr + '</p>';
        }
      }
      //work with table
      // if (regexchecktable.test(block) === true) {
      //   const matchtable = block.match(regexgettable);
      //   // console.log(matchtable);
      // }
    });
    return obj;
  }
}
