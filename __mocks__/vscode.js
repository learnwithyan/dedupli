// __mocks__/vscode.js

const vscode = jest.createMockFromModule('vscode');

// Mock the window object with basic functionality required for testing
vscode.window = {
  showInformationMessage: jest.fn(),
  activeTextEditor: {
    selection: {
      start: {
        line: 0,
        character: 0,
      },
      end: {
        line: 0,
        character: 0,
      },
    },
    edit: jest.fn(),
    document: {
      getText: jest.fn(),
    },
  },
};

module.exports = vscode;
