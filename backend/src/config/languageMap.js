/**
 * Centralized Language Configuration for Judge0
 * Maps internal language keys to Judge0 IDs and limits
 */
const LANGUAGE_MAP = {
    python: {
        id: 71,
        name: 'Python 3.8.1',
        isCompiled: false,
        extension: '.py',
        timeLimit: 2, // seconds
        memoryLimit: 128 * 1024, // KB
    },
    javascript: {
        id: 63,
        name: 'Node.js 12.14.0',
        isCompiled: false,
        extension: '.js',
        timeLimit: 2,
        memoryLimit: 128 * 1024,
    },
    cpp: {
        id: 54,
        name: 'C++ (GCC 9.2.0)',
        isCompiled: true,
        extension: '.cpp',
        timeLimit: 1, // Stricter for C++
        memoryLimit: 128 * 1024,
    },
    java: {
        id: 62,
        name: 'Java (OpenJDK 13.0.1)',
        isCompiled: true,
        extension: '.java',
        timeLimit: 2, // Java needs more startup time
        memoryLimit: 256 * 1024, // Java needs more memory
    },
    c: {
        id: 50,
        name: 'C (GCC 9.2.0)',
        isCompiled: true,
        extension: '.c',
        timeLimit: 1,
        memoryLimit: 128 * 1024,
    }
};

module.exports = LANGUAGE_MAP;
