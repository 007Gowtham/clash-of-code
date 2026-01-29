/**
 * Code Template Service - FINAL FIXED VERSION
 * 
 * Fixes:
 * 1. Includes class definition and footer
 * 2. Properly handles user code formatting
 * 3. Adds indentation if user forgets it
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

class CodeTemplateService {
  /**
   * Get template for a question and language
   */
  async getTemplate(questionId, language) {
    try {
      const template = await prisma.questionTemplate.findUnique({
        where: {
          questionId_language: {
            questionId,
            language
          }
        }
      });

      if (template) {
        logger.info(`Template found in DB for question ${questionId}, language ${language}`);
        return template;
      }

      const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { title: true }
      });

      if (question) {
        const fallback = this.getFallbackTemplate(question.title, language);
        if (fallback) {
          logger.info(`Using fallback template for "${question.title}" (${language})`);
          return fallback;
        }
      }

      throw new Error(`Template not found for question ${questionId}, language ${language}`);
    } catch (error) {
      logger.error(`Error getting template:`, error);
      throw error;
    }
  }

  /**
   * Format user code for C++/Java (ensure proper indentation)
   */
  formatUserCodeForClass(userCode, language) {
    if (language !== 'cpp' && language !== 'java') {
      return userCode; // Python/JS don't need class formatting
    }

    // Check if code already has proper indentation
    const lines = userCode.split('\n');
    const firstLine = lines[0] || '';
    
    // If first line already starts with spaces/tabs, assume it's properly formatted
    if (firstLine.match(/^[\s\t]/)) {
      return userCode;
    }

    // If code is on a single line or lacks indentation, add it
    if (lines.length === 1 || !firstLine.match(/^[\s\t]/)) {
      // Add 4 spaces to each line
      return lines.map(line => {
        if (line.trim() === '') return line; // Keep empty lines
        return '    ' + line; // Add 4 spaces
      }).join('\n');
    }

    return userCode;
  }

  /**
   * Generate complete executable code
   */
  async generateExecutableCode(questionId, language, userFunctionCode) {
    try {
      const template = await this.getTemplate(questionId, language);
      const parts = [];
      const isCppOrJava = language === 'cpp' || language === 'java';

      logger.info(`Generating executable code for question ${questionId}, language ${language}`);

      // 1️⃣ Header code
      if (template.headerCode) {
        parts.push(template.headerCode.trim());
        logger.debug('Added headerCode');
      }

      // 2️⃣ Definition (class Solution {) - CRITICAL for C++/Java
      if (isCppOrJava && template.definition) {
        parts.push(template.definition.trim());
        logger.debug('Added definition (class declaration)');
      }

      // 3️⃣ User's function - FORMAT IT PROPERLY!
      if (userFunctionCode) {
        const formattedCode = this.formatUserCodeForClass(userFunctionCode, language);
        parts.push(formattedCode.trim());
        logger.debug('Added user function code (formatted)');
      } else {
        logger.warn('No user function code provided, using template default');
        if (template.userFunction) {
          parts.push(template.userFunction.trim());
        }
      }

      // 4️⃣ Footer code (};) - CRITICAL for C++/Java
      if (isCppOrJava && template.footerCode) {
        parts.push(template.footerCode.trim());
        logger.debug('Added footerCode (class closing)');
      }

      // 5️⃣ Main function
      if (template.mainFunction) {
        parts.push(template.mainFunction.trim());
        logger.debug('Added mainFunction');
      }

      // 6️⃣ Boilerplate
      if (template.boilerplate) {
        parts.push(template.boilerplate.trim());
        logger.debug('Added boilerplate');
      }

      const finalCode = parts.filter(Boolean).join('\n\n');

      // 🛡️ Validation
      if (language === 'cpp') {
        this.validateCppCode(finalCode);
      }

      if (language === 'java') {
        this.validateJavaCode(finalCode);
      }

      logger.info(`Successfully generated executable code: ${finalCode.length} bytes`);
      return finalCode;

    } catch (error) {
      logger.error(`Failed to generate executable code:`, error);
      throw error;
    }
  }

  /**
   * Validate C++ code structure
   */
  validateCppCode(code) {
    if (!code.includes('class Solution')) {
      throw new Error('C++ validation error: Solution class missing');
    }

    // Count opening and closing braces for class
    const classStart = code.indexOf('class Solution {');
    if (classStart === -1) {
      throw new Error('C++ validation error: class Solution { not found');
    }

    const afterClass = code.substring(classStart);
    const openBraces = (afterClass.match(/\{/g) || []).length;
    const closeBraces = (afterClass.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      logger.warn(`C++ brace mismatch: ${openBraces} opening, ${closeBraces} closing`);
      // Don't throw - let compiler catch it with better error message
    }

    const solutionIndex = code.indexOf('class Solution');
    const mainIndex = code.indexOf('int main');

    if (mainIndex !== -1 && solutionIndex > mainIndex) {
      throw new Error('C++ validation error: main() appears before Solution class');
    }

    logger.debug('C++ code validation passed');
  }

  /**
   * Validate Java code structure
   */
  validateJavaCode(code) {
    if (!code.includes('class Solution')) {
      throw new Error('Java validation error: Solution class missing');
    }

    if (!code.includes('class Main')) {
      throw new Error('Java validation error: Main class missing');
    }

    logger.debug('Java code validation passed');
  }

  /**
   * Get user function template
   */
  async getUserFunctionTemplate(questionId, language) {
    try {
      const template = await this.getTemplate(questionId, language);
      return template.userFunction || '';
    } catch (error) {
      logger.error(`Failed to get user function template:`, error);
      throw error;
    }
  }

  /**
   * Save or update template
   */
  async saveTemplate(questionId, language, templateData) {
    try {
      const template = await prisma.questionTemplate.upsert({
        where: {
          questionId_language: {
            questionId,
            language
          }
        },
        update: {
          headerCode: templateData.headerCode || '',
          definition: templateData.definition || '',
          footerCode: templateData.footerCode || '',
          userFunction: templateData.userFunction || '',
          mainFunction: templateData.mainFunction || '',
          boilerplate: templateData.boilerplate || '',
          diagram: templateData.diagram || null,
          updatedAt: new Date()
        },
        create: {
          questionId,
          language,
          headerCode: templateData.headerCode || '',
          definition: templateData.definition || '',
          footerCode: templateData.footerCode || '',
          userFunction: templateData.userFunction || '',
          mainFunction: templateData.mainFunction || '',
          boilerplate: templateData.boilerplate || '',
          diagram: templateData.diagram || null
        }
      });

      logger.info(`Template saved for question ${questionId}, language ${language}`);
      return template;
    } catch (error) {
      logger.error(`Failed to save template:`, error);
      throw error;
    }
  }

  /**
   * Get all templates for a question
   */
  async getAllTemplatesForQuestion(questionId) {
    try {
      return await prisma.questionTemplate.findMany({
        where: { questionId },
        orderBy: { language: 'asc' }
      });
    } catch (error) {
      logger.error(`Failed to get templates for question:`, error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(questionId, language) {
    try {
      const deleted = await prisma.questionTemplate.delete({
        where: {
          questionId_language: {
            questionId,
            language
          }
        }
      });

      logger.info(`Template deleted for question ${questionId}, language ${language}`);
      return deleted;
    } catch (error) {
      logger.error(`Failed to delete template:`, error);
      throw error;
    }
  }

  /**
   * Fallback templates
   */
  getFallbackTemplate(title, language) {
    if (title !== 'Two Sum') return null;

    const templates = {
      cpp: {
        headerCode: '#include <bits/stdc++.h>\nusing namespace std;',
        definition: 'class Solution {\npublic:',
        footerCode: '};',
        userFunction: '    vector<int> twoSum(vector<int>& nums, int target) {\n        // TODO: Implement your solution here\n        return {};\n    }',
        mainFunction: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string line;
    getline(cin, line);

    vector<int> nums;
    string temp;
    for (char c : line) {
        if (isdigit(c) || c == '-') temp += c;
        else if (!temp.empty()) {
            nums.push_back(stoi(temp));
            temp.clear();
        }
    }
    if (!temp.empty()) nums.push_back(stoi(temp));

    int target;
    cin >> target;

    Solution sol;
    vector<int> ans = sol.twoSum(nums, target);

    cout << "[";
    for (int i = 0; i < ans.size(); i++) {
        cout << ans[i];
        if (i + 1 < ans.size()) cout << ",";
    }
    cout << "]";
    return 0;
}`,
        boilerplate: ''
      },

      java: {
        headerCode: 'import java.io.*;\nimport java.util.*;',
        definition: 'class Solution {',
        footerCode: '}',
        userFunction: '    public int[] twoSum(int[] nums, int target) {\n        // TODO: Implement your solution here\n        return new int[]{};\n    }',
        mainFunction: `class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine().replaceAll("\\\\[|\\\\]", "");
        String[] parts = line.split(",");

        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());

        int target = Integer.parseInt(br.readLine().trim());
        Solution sol = new Solution();
        int[] ans = sol.twoSum(nums, target);

        System.out.print("[");
        for (int i = 0; i < ans.length; i++) {
            System.out.print(ans[i]);
            if (i + 1 < ans.length) System.out.print(",");
        }
        System.out.print("]");
    }
}`,
        boilerplate: ''
      },

      python: {
        headerCode: 'import sys\nimport json',
        definition: '',
        footerCode: '',
        userFunction: 'def twoSum(nums, target):\n    # TODO: Implement your solution here\n    return []',
        mainFunction: `if __name__ == '__main__':
    data = sys.stdin.read().splitlines()
    nums = json.loads(data[0])
    target = json.loads(data[1])
    print(json.dumps(twoSum(nums, target)))`,
        boilerplate: ''
      },

      javascript: {
        headerCode: '',
        definition: '',
        footerCode: '',
        userFunction: 'var twoSum = function(nums, target) {\n    // TODO: Implement your solution here\n    return [];\n};',
        mainFunction: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim().split('\\n');
const nums = JSON.parse(input[0]);
const target = Number(input[1]);
console.log(JSON.stringify(twoSum(nums, target)));`,
        boilerplate: ''
      }
    };

    return templates[language] || null;
  }

  /**
   * Batch save templates
   */
  async batchSaveTemplates(questionId, templates) {
    try {
      const savedTemplates = [];

      for (const template of templates) {
        const saved = await this.saveTemplate(questionId, template.language, template);
        savedTemplates.push(saved);
      }

      logger.info(`Batch saved ${savedTemplates.length} templates for question ${questionId}`);
      return savedTemplates;
    } catch (error) {
      logger.error(`Failed to batch save templates:`, error);
      throw error;
    }
  }
}

module.exports = new CodeTemplateService();