const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTwoSum() {
    try {
        const question = await prisma.question.findFirst({
            where: { title: 'Two Sum' }
        });

        if (!question) {
            console.log('Two Sum question not found');
            return;
        }

        const templates = [
            {
                language: 'python',
                userFunction: `def twoSum(nums, target):
    """
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

    Args:
        nums: List of integers
        target: Integer target sum

    Returns:
        List[int]: Indices of the two numbers
    """
    # TODO: Implement your solution here
    # You may assume that each input would have exactly one solution,
    # and you may not use the same element twice.
    pass`,
                headerCode: '',
                boilerplate: '',
                definition: ''
            },
            {
                language: 'javascript',
                userFunction: `/**
 * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
 *
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // TODO: Implement your solution here
    // You may assume that each input would have exactly one solution,
    // and you may not use the same element twice.
    
};`,
                headerCode: '',
                boilerplate: '',
                definition: ''
            },
            {
                language: 'java',
                definition: `class Solution {`,
                userFunction: `    /**
     * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
     *
     * @param nums Array of integers
     * @param target Integer target sum
     * @return Array of integers (indices)
     */
    public int[] twoSum(int[] nums, int target) {
        // TODO: Implement your solution here
        // You may assume that each input would have exactly one solution,
        // and you may not use the same element twice.
        return new int[]{};
    }
}`,
                headerCode: '',
                boilerplate: ''
            },
            {
                language: 'cpp',
                definition: `class Solution {
public:`,
                userFunction: `    /**
     * Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
     *
     * @param nums Vector of integers
     * @param target Integer target sum
     * @return Vector of integers (indices)
     */
    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: Implement your solution here
        // You may assume that each input would have exactly one solution,
        // and you may not use the same element twice.
        return {};
    }
};`,
                headerCode: '',
                boilerplate: ''
            }
        ];

        // Delete existing templates
        await prisma.questionTemplate.deleteMany({
            where: { questionId: question.id }
        });

        // Create new templates
        await prisma.questionTemplate.createMany({
            data: templates.map(t => ({
                ...t,
                questionId: question.id,
                mainFunction: '' // Required field
            }))
        });

        console.log('Successfully updated Two Sum templates');

    } catch (error) {
        console.error('Error updating Two Sum:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateTwoSum();
