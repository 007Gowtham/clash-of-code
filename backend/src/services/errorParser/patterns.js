/**
 * Error matching patterns for different languages
 */
module.exports = {
    python: [
        {
            category: 'SYNTAX_ERROR',
            pattern: /SyntaxError: invalid syntax/,
            message: 'Invalid syntax detected',
            suggestions: [
                'Check for missing colons (:) at the end of if/for/def lines',
                'Ensure all parentheses/brackets are closed',
                'Check indentation levels'
            ]
        },
        {
            category: 'INDENTATION_ERROR',
            pattern: /IndentationError: expected an indented block/,
            message: 'Missing indentation',
            suggestions: [
                'Add 4 spaces or 1 tab after the colon',
                'Ensure indentation is consistent'
            ]
        },
        {
            category: 'NAME_ERROR',
            pattern: /NameError: name '(.*)' is not defined/,
            extract: (match) => match[1],
            message: (variable) => `Variable '${variable}' is used but not defined`,
            suggestions: [
                'Check for typos in variable names',
                'Ensure the variable is declared before use',
                'Check variable scope'
            ]
        }
    ],
    cpp: [
        {
            category: 'SYNTAX_ERROR',
            pattern: /expected ';' before/,
            message: 'Missing semicolon',
            suggestions: [
                'Add a semicolon (;) at the end of the previous line'
            ]
        },
        {
            category: 'UNDECLARED_VARIABLE',
            pattern: /error: '(.*)' was not declared in this scope/,
            extract: (match) => match[1],
            message: (variable) => `Variable '${variable}' is not declared`,
            suggestions: [
                'Declare the variable type (e.g., int, string)',
                'Check for typos'
            ]
        }
    ],
    javascript: [
        {
            category: 'SYNTAX_ERROR',
            pattern: /SyntaxError: Unexpected token/,
            message: 'Unexpected syntax element',
            suggestions: [
                'Check for mismatched brackets or parentheses',
                'Verify syntax'
            ]
        },
        {
            category: 'REFERENCE_ERROR',
            pattern: /ReferenceError: (.*) is not defined/,
            extract: (match) => match[1],
            message: (variable) => `Variable '${variable}' is not defined`,
            suggestions: [
                'Declare output variable with let, const, or var',
                'Check for typos'
            ]
        }
    ],
    java: [
        {
            category: 'SYNTAX_ERROR',
            pattern: /error: ';' expected/,
            message: 'Missing semicolon',
            suggestions: ['Add a semicolon (;) at the end of the statement']
        },
        {
            category: 'SYMBOL_NOT_FOUND',
            pattern: /error: cannot find symbol/,
            message: 'Cannot find variable or method',
            suggestions: [
                'Check variable/method spelling',
                'Ensure libraries are imported',
                'Check variable scope'
            ]
        }
    ]
};
