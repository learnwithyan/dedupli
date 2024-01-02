var vscode = require('vscode');

function activate(context) {
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
      lines.forEach(function (line) {
        if (distinct_lines.indexOf(line) < 0) {
          distinct_lines.push(line);
        }
      }, this);

      editor.edit(function (editBuilder) {
        editBuilder.replace(selection, distinct_lines.join('\n'));
      });
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

      editor.edit(function (editBuilder) {
        editBuilder.replace(selection, random_lines.join('\n'));
      });
    }
  );

  context.subscriptions.push(disposableremDuplicates);
  context.subscriptions.push(disposableShuffle);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;

function randomizeArrayOrder(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temporaryValue = array[i];
    array[i] = array[j];
    array[j] = temporaryValue;
  }
  return array;
}
