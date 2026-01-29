const questionController = require('./questionController');
const submissionController = require('./submissionController');

// Delegate to existing controllers to reuse logic
exports.getTestingQuestions = questionController.getAllQuestions;
exports.runCode = submissionController.runUserFunction;
exports.submitCode = submissionController.submitUserFunction;
