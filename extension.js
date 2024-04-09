var vscode = require('vscode');
const fs = require('fs');
const path = require('path'); // Import the 'path' module

const extFuncs = require('./files/funcs.js');

function activate(context) {
  let flag;
  let text;

  context.subscriptions.push(
    vscode.commands.registerCommand('dedupli.com1', function () {
      extFuncs.trnslReadmeHandler(flag);
    }),
    vscode.commands.registerCommand('dedupli.com2', function () {
      remDuplicatesHandler(flag, text);
    }),
    vscode.commands.registerCommand('dedupli.com3', function () {
      shuffleHandler(flag, text);
    }),
    vscode.commands.registerCommand('dedupli.com4', function () {
      base64Handler(flag, text);
    }),
    vscode.commands.registerCommand('dedupli.com5', function () {
      emptyLinesHandler(flag, text);
    }),
    vscode.commands.registerCommand('dedupli.com6', function () {
      capitalizeHandler(flag, text);
    })
  );
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

// function helpers
//remove empty lines
function emptyLinesHandler(flag, text) {
  if (flag == undefined) {
    var language = vscode.env.language;

    var editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    var selection = editor.selection;
    var text = editor.document.getText(selection);
    var lines = text.split('\n');
  } else {
    var lines = text.split('\n');
  }
  // Remove empty lines
  var nonEmptyLines = lines.filter((line) => line.trim() !== '');
  // Join the non-empty lines back into a single string
  var updatedText = nonEmptyLines.join('\n');
  // Replace the selected text with the updated text
  if (flag == undefined) {
    editor.edit((editBuilder) => {
      editBuilder.replace(selection, updatedText);
      extFuncs.infoMsg(
        vscode,
        vscode.l10n.t('Empty lines were deleted', language)
      );
    });
  } else {
    return nonEmptyLines.join('\n');
  }
}

//base64
function base64Handler(flag, text) {
  if (flag == undefined) {
    var language = vscode.env.language;
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    console.log(editor);
    var selection = editor.selection;
    var text = editor.document.getText(selection);
    var lines = text.split('\n');

    if (lines[lines.length - 1] === '\n') {
      lines.pop();
    }
  } else {
    var lines = text.split('\n');
  }

  var base64_lines = base64ArrayOrder(lines);
  if (typeof base64_lines !== 'undefined' && base64_lines.length > 0) {
    if (flag == undefined) {
      editor.edit(function (editBuilder) {
        editBuilder.replace(selection, base64_lines.join('\n'));
      });
    } else {
      // return text;
      lines = [];
      return base64_lines.join('\n');
    }
    extFuncs.infoMsg(
      vscode,
      vscode.l10n.t('Lines converted to base64', language)
    );
  } else {
    extFuncs.warnMsg(
      vscode,
      vscode.l10n.t('Lines were NOT converted to base64', language)
    );
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
function shuffleHandler(flag, text) {
  if (flag == undefined) {
    var language = vscode.env.language;

    var editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    var selection = editor.selection;
    var text = editor.document.getText(selection);
    var lines = text.split('\n');
  } else {
    var lines = text.split('\n');
  }
  if (lines[lines.length - 1] === '\n') {
    lines.pop();
  }

  var random_lines = randomizeArrayOrder(lines);
  if (typeof random_lines !== 'undefined' && random_lines.length > 0) {
    if (flag == undefined) {
      editor.edit(function (editBuilder) {
        editBuilder.replace(selection, random_lines.join('\n'));
      });
    } else {
      return random_lines.join('\n');
    }
    extFuncs.infoMsg(vscode, vscode.l10n.t('Lines shuffled', language));
  } else {
    extFuncs.warnMsg(vscode, vscode.l10n.t("List wasn't shuffled", language));
  }
}

//rem duplicates
function remDuplicatesHandler(flag, text) {
  if (flag == undefined) {
    var language = vscode.env.language;

    var editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    var selection = editor.selection;
    var text = editor.document.getText(selection);
    var lines = text.split('\n');
  } else {
    var lines = text.split('\n');
  }
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
    if (flag == undefined) {
      editor.edit(function (editBuilder) {
        editBuilder.replace(selection, distinct_lines.join('\n'));
      });

      var counter = {
        distinct: distinct_lines,
        duplicate: duplicate_lines,
      };
      extFuncs.infoMsg(vscode, vscode.l10n.t('Duplicates removed', language));

      distinct_lines.length = 0;
    } else {
      return distinct_lines.join('\n');
    }
  } else if (distinct_lines.length > 0 && duplicate_lines.length == 0) {
    if (flag == undefined) {
      var counter = {
        distinct: distinct_lines,
      };
      extFuncs.warnMsg(
        vscode,
        vscode.l10n.t('List has not duplicates', language)
      );
      duplicate_lines.length = 0;
    } else {
      return distinct_lines.join('\n');
    }
  } else if (duplicate_lines.length > 0 && distinct_lines.length > 0) {
    if (flag == undefined) {
      editor.edit(function (editBuilder) {
        editBuilder.replace(selection, distinct_lines.join('\n'));
      });
      var counter = {
        distinct: distinct_lines,
        duplicate: duplicate_lines,
      };
      extFuncs.infoMsg(
        vscode,
        vscode.l10n.t('Duplicates removed', language),
        counter
      );

      distinct_lines.length = 0;
      duplicate_lines.length = 0;
    } else {
      return distinct_lines.join('\n');
    }
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

//capitalize words
function capitalizeHandler(flag, text) {
  if (flag == undefined) {
    var language = vscode.env.language;
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    console.log(editor);
    var selection = editor.selection;
    var text = editor.document.getText(selection);
    var lines = text.split('\n');

    if (lines[lines.length - 1] === '\n') {
      lines.pop();
    }
  } else {
    var lines = text.split('\n');
  }

  // var base64_lines = base64ArrayOrder(lines);
  var capitalizedLines = lines.map((line) => line.toUpperCase());
  if (typeof capitalizedLines !== 'undefined' && capitalizedLines.length > 0) {
    if (flag == undefined) {
      editor.edit(function (editBuilder) {
        editBuilder.replace(selection, capitalizedLines.join('\n'));
      });
    } else {
      // return text;
      lines = [];
      return capitalizedLines.join('\n');
    }
    extFuncs.infoMsg(vscode, vscode.l10n.t('Lines capitalized', language));
  } else {
    extFuncs.warnMsg(
      vscode,
      vscode.l10n.t('Lines were NOT converted capitalized', language)
    );
  }
}

// module.exports = {
//   base64Handler,
//   remDuplicatesHandler,
//   shuffleHandler,
//   emptyLinesHandler,
//   capitalizeHandler,
// };
