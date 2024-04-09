// extension.test.js
const moduleFuncs = require('../extension');

describe('base64', () => {
  test('text to base64', () => {
    const flag = 'test';
    const text = '123\n456\n';
    const encodedText = moduleFuncs.base64Handler(flag, text);
    expect(encodedText).toBe('MTIz\nNDU2\n');
  });
});
describe('Remduplicates', () => {
  test('remove duplicates', () => {
    const flag = 'test';
    const text = '123\n456\n456\n';
    const encodedText = moduleFuncs.remDuplicatesHandler(flag, text);
    expect(encodedText).toBe('123\n456\n');
  });
});
describe('shuffleHandler', () => {
  test('shuffleHandler', () => {
    const flag = 'test';
    const text = '123\n456\n456\n';
    const encodedText = moduleFuncs.shuffleHandler(flag, text);
    // console.log(encodedText);

    expect(encodedText).toBeDefined();
  });
});
describe('emptyLinesHandler', () => {
  test('emptyLinesHandler', () => {
    const flag = 'test';
    const text = '123\n\n4\n4';
    const encodedText = moduleFuncs.emptyLinesHandler(flag, text);
    // console.log(encodedText);

    expect(encodedText).toBe('123\n4\n4');
  });
});
describe('capitalizeHandler', () => {
  test('capitalizeHandler', () => {
    const flag = 'test';
    const text = 'hello';
    const encodedText = moduleFuncs.capitalizeHandler(flag, text);
    // console.log(encodedText);

    expect(encodedText).toBe('HELLO');
  });
});
