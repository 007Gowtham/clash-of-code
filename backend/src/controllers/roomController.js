const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateRoomCode, generateInviteLink } = require('../utils/generateCode');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// Create Room
exports.createRoom = async (req, res, next) => {
    try {
        const {
            roomName,
            mode,
            maxTeamSize,
            duration,
            scoringMode,
            difficulty,
            privacy,
            password,
            leaderApprovalRequired,
            allowSolosInTeamMode,
        } = req.body;



        // Generate unique room code
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = generateRoomCode();
            const existing = await prisma.room.findUnique({ where: { code } });
            if (!existing) isUnique = true;
        }

        const inviteLink = generateInviteLink(code);

        // Create room
        const room = await prisma.room.create({
            data: {
                name: roomName,
                code,
                inviteLink,
                password: password ? await bcrypt.hash(password, 10) : null,
                adminId: req.user.id,
                status: 'WAITING',
                duration: parseInt(duration),
                settings: {
                    mode,
                    maxTeamSize,
                    scoringMode,
                    difficulty,
                    privacy,
                    leaderApprovalRequired,
                    allowSolosInTeamMode,
                },
            },
        });

        // Seed 5 Template Questions (For Testing) - LeetCode Style
        const TEMPLATE_QUESTIONS = [
            {
                title: 'Two Sum',
                description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
                difficulty: 'EASY',
                points: 100,
                sampleInput: 'nums = [2,7,11,15], target = 9',
                sampleOutput: '[0,1]',
                constraints: [
                    '2 <= nums.length <= 10^4',
                    '-10^9 <= nums[i] <= 10^9',
                    '-10^9 <= target <= 10^9',
                    'Only one valid answer exists.'
                ],
                testCases: [
                    {
                        input: '[2,7,11,15]\n9',
                        output: '[0,1]',
                        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: '[3,2,4]\n6',
                        output: '[1,2]',
                        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: '[3,3]\n6',
                        output: '[0,1]',
                        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].',
                        isHidden: false,
                        isSample: true
                    }
                ],
                hints: [
                    'A brute force approach would be to check every pair of numbers. What is the time complexity?',
                    'Think about how you can reduce the time complexity using a hash map.',
                    'For each number, check if its complement (target - num) exists in the hash map.'
                ],
                templates: [
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
                        mainFunction: ''
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
                        mainFunction: ''
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
                        mainFunction: ''
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
                        mainFunction: ''
                    }
                ]
            },
            {
                title: 'Binary Tree Level Order Traversal',
                description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
                difficulty: 'MEDIUM',
                points: 200,
                sampleInput: 'root = [3,9,20,null,null,15,7]',
                sampleOutput: '[[3],[9,20],[15,7]]',
                constraints: [
                    'The number of nodes in the tree is in the range [0, 2000].',
                    '-1000 <= Node.val <= 1000'
                ],
                testCases: [
                    {
                        input: '[3,9,20,null,null,15,7]',
                        output: '[[3],[9,20],[15,7]]',
                        explanation: 'Level 0: [3], Level 1: [9,20], Level 2: [15,7]',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: '[1]',
                        output: '[[1]]',
                        explanation: 'Single node tree has only one level.',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: '[]',
                        output: '[]',
                        explanation: 'Empty tree returns empty array.',
                        isHidden: false,
                        isSample: true
                    }
                ],
                hints: [
                    'Use a queue data structure for Breadth-First Search (BFS).',
                    'Process nodes level by level, keeping track of the current level size.',
                    'Add all nodes at the current level to the result before moving to the next level.'
                ]
            },
            {
                title: 'Longest Palindromic Substring',
                description: `Given a string s, return the longest palindromic substring in s.

A palindrome is a string that reads the same backward as forward.`,
                difficulty: 'MEDIUM',
                points: 250,
                sampleInput: 's = "babad"',
                sampleOutput: '"bab"',
                constraints: [
                    '1 <= s.length <= 1000',
                    's consist of only digits and English letters.'
                ],
                testCases: [
                    {
                        input: 'babad',
                        output: 'bab',
                        explanation: '"aba" is also a valid answer. Both "bab" and "aba" are palindromes.',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: 'cbbd',
                        output: 'bb',
                        explanation: 'The longest palindromic substring is "bb".',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: 'a',
                        output: 'a',
                        explanation: 'Single character is always a palindrome.',
                        isHidden: false,
                        isSample: true
                    }
                ],
                hints: [
                    'Think about expanding around the center of potential palindromes.',
                    'Remember that palindromes can have odd length (single center) or even length (two centers).',
                    'For each position, try expanding outward while characters match.',
                    'Keep track of the longest palindrome found so far.'
                ]
            },
            {
                title: 'Merge K Sorted Lists',
                description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
                difficulty: 'HARD',
                points: 400,
                sampleInput: 'lists = [[1,4,5],[1,3,4],[2,6]]',
                sampleOutput: '[1,1,2,3,4,4,5,6]',
                constraints: [
                    'k == lists.length',
                    '0 <= k <= 10^4',
                    '0 <= lists[i].length <= 500',
                    '-10^4 <= lists[i][j] <= 10^4',
                    'lists[i] is sorted in ascending order.',
                    'The sum of lists[i].length will not exceed 10^4.'
                ],
                testCases: [
                    {
                        input: '[[1,4,5],[1,3,4],[2,6]]',
                        output: '[1,1,2,3,4,4,5,6]',
                        explanation: 'Merging all three sorted lists: [1,4,5], [1,3,4], and [2,6] results in [1,1,2,3,4,4,5,6].',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: '[]',
                        output: '[]',
                        explanation: 'No lists to merge.',
                        isHidden: false,
                        isSample: true
                    },
                    {
                        input: '[[]]',
                        output: '[]',
                        explanation: 'Single empty list results in empty output.',
                        isHidden: false,
                        isSample: true
                    }
                ],
                hints: [
                    'The brute force approach is to merge lists one by one. What is the time complexity?',
                    'Think about using a Min-Heap (Priority Queue) to efficiently find the smallest element.',
                    'Add the head of each list to the heap, then repeatedly extract the minimum and add the next node.',
                    'Consider the divide and conquer approach: merge pairs of lists, then merge the results.'
                ]
            }
        ];

        await Promise.all(TEMPLATE_QUESTIONS.map(q => {
            const { constraints, testCases, hints, templates, ...rest } = q;
            return prisma.question.create({
                data: {
                    ...rest,
                    roomId: room.id,
                    constraints: {
                        create: constraints.map((c, i) => ({ content: c, order: i }))
                    },
                    testCases: {
                        create: testCases.map((tc, i) => ({
                            ...tc,
                            order: i
                        }))
                    },
                    hints: {
                        create: hints.map((h, i) => ({ content: h, order: i }))
                    },
                    templates: templates ? {
                        create: templates
                    } : undefined
                }
            });
        }));


        return successResponse(
            res,
            {
                id: room.id,
                roomName: room.name,
                code: room.code,
                inviteLink: room.inviteLink,
                mode,
                maxTeamSize,
                duration: room.duration,
                scoringMode,
                difficulty,
                privacy,
                hasPassword: !!password,
                status: room.status,
                adminId: room.adminId,
                createdAt: room.createdAt,
            },
            'Room created successfully',
            201
        );
    } catch (error) {
        next(error);
    }
};

// Get All Rooms
exports.getAllRooms = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) {
            where.status = status;
        }

        const [rooms, totalRooms] = await Promise.all([
            prisma.room.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    admin: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    teams: {
                        include: {
                            members: true,
                        },
                    },
                    questions: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.room.count({ where }),
        ]);

        const formattedRooms = rooms.map((room) => ({
            id: room.id,
            name: room.name,
            code: room.code,
            hasPassword: !!room.password,
            status: room.status,
            admin: room.admin,
            teamsCount: room.teams.length,
            totalParticipants: room.teams.reduce((sum, team) => sum + team.members.length, 0),
            questionsCount: room.questions.length,
            duration: room.duration,
            startTime: room.startTime,
            endTime: room.endTime,
            createdAt: room.createdAt,
            settings: room.settings,
        }));

        return successResponse(res, {
            rooms: formattedRooms,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRooms / parseInt(limit)),
                totalRooms,
                hasMore: skip + formattedRooms.length < totalRooms,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get Room Details
exports.getRoomDetails = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { language = 'cpp' } = req.query;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                admin: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                teams: {
                    include: {
                        leader: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                        members: true,
                        assignments: {
                            where: {
                                status: 'SOLVED',
                            },
                        },
                    },
                },
                questions: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        points: true,
                        slug: true,
                        templates: {
                            // Fetch ALL languages
                            select: {
                                language: true,
                                headerCode: true,
                                boilerplate: true,
                                definition: true,
                                userFunction: true,
                                mainFunction: true,
                                diagram: true
                            }
                        }
                    },
                },
            },
        });

        // Debug logging to verify definition field
        if (room?.questions?.length > 0 && room.questions[0].templates?.length > 0) {
            console.log('Template Definition Check:', room.questions[0].templates[0].definition ? 'PRESENT' : 'MISSING');
        }

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        // Check if current user is in a team
        let myTeam = null;
        for (const team of room.teams) {
            const isMember = team.members.some((m) => m.userId === req.user.id);
            if (isMember) {
                myTeam = {
                    id: team.id,
                    name: team.name,
                    role: team.leaderId === req.user.id ? 'LEADER' : 'MEMBER',
                };
                break;
            }
        }

        const formattedTeams = room.teams.map((team) => ({
            id: team.id,
            name: team.name,
            leaderId: team.leaderId,
            leaderName: team.leader.username,
            visibility: team.visibility,
            totalPoints: team.totalPoints,
            membersCount: team.members.length,
            questionsSolved: team.assignments.length,
        }));

        // Format questions with flattened template data
        const formattedQuestions = room.questions.map(q => {
            // Group templates by language
            const templatesMap = {};
            if (q.templates) {
                q.templates.forEach(t => {
                    templatesMap[t.language] = {
                        headerCode: t.headerCode || '',
                        boilerplate: t.boilerplate || '',
                        definition: t.definition || '',
                        userFunction: t.userFunction || '',
                        mainFunction: t.mainFunction || '',
                        diagram: t.diagram || null
                    };
                });
            }

            return {
                id: q.id,
                title: q.title,
                difficulty: q.difficulty,
                points: q.points,
                slug: q.slug,
                // Return all templates
                templates: templatesMap,
                // For backward compatibility (optional, or remove if frontend updated)
                // Defaulting to cpp or first available if needed, but intended usage is `templates[lang]`
            };
        });

        const timeRemaining = room.endTime
            ? Math.max(0, new Date(room.endTime).getTime() - Date.now())
            : null;

        return successResponse(res, {
            id: room.id,
            name: room.name,
            code: room.code,
            inviteLink: room.inviteLink,
            hasPassword: !!room.password,
            status: room.status,
            duration: room.duration,
            startTime: room.startTime,
            endTime: room.endTime,
            timeRemaining,
            admin: room.admin,
            teams: formattedTeams,
            questions: formattedQuestions,
            isAdmin: room.adminId === req.user.id,
            isParticipant: !!myTeam,
            myTeam,
            createdAt: room.createdAt,
            settings: room.settings,
        });
    } catch (error) {
        next(error);
    }
};

// Join Room
exports.joinRoom = async (req, res, next) => {
    try {
        const { code, password } = req.body;

        const room = await prisma.room.findUnique({
            where: { code },
        });

        if (!room) {
            return errorResponse(res, 'Room not found with this code', 404);
        }

        // Check password if room has one
        if (room.password) {
            if (!password) {
                return errorResponse(res, 'Room password required', 401);
            }
            const isValidPassword = await bcrypt.compare(password, room.password);
            if (!isValidPassword) {
                return errorResponse(res, 'Incorrect room password', 401);
            }
        }

        // Check if room has started
        if (room.status === 'ACTIVE') {
            return errorResponse(res, 'Room has already started', 400);
        }

        if (room.status === 'COMPLETED') {
            return errorResponse(res, 'Room has ended', 400);
        }

        return successResponse(res, {
            room: {
                id: room.id,
                roomName: room.name,
                code: room.code,
                status: room.status,
                settings: room.settings,
            },
        }, 'Joined room successfully');
    } catch (error) {
        next(error);
    }
};

// Start Room
exports.startRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                teams: true,
                questions: true,
            },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        if (room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can start the room', 403);
        }

        if (room.status !== 'WAITING') {
            return errorResponse(res, 'Room has already started or ended', 400);
        }

        if (room.teams.length === 0) {
            return errorResponse(res, 'Cannot start room without teams', 400);
        }

        if (room.questions.length === 0) {
            return errorResponse(res, 'Cannot start room without questions', 400);
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + room.duration * 60 * 1000);

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                status: 'ACTIVE',
                startTime,
                endTime,
            },
        });

        // TODO: Emit socket event to all participants

        return successResponse(res, {
            id: updatedRoom.id,
            status: updatedRoom.status,
            startTime: updatedRoom.startTime,
            endTime: updatedRoom.endTime,
        }, 'Room started successfully');
    } catch (error) {
        next(error);
    }
};

// End Room
exports.endRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                teams: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                    },
                                },
                            },
                        },
                        assignments: {
                            where: {
                                status: 'SOLVED',
                            },
                            include: {
                                question: {
                                    select: {
                                        title: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        if (room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can end the room', 403);
        }

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                status: 'COMPLETED',
                endTime: new Date(),
            },
        });

        // Generate leaderboard
        const leaderboard = room.teams
            .map((team, index) => ({
                rank: index + 1,
                teamId: team.id,
                teamName: team.name,
                totalPoints: team.totalPoints,
                questionsSolved: team.assignments.length,
                members: team.members.map((m) => ({
                    userId: m.user.id,
                    username: m.user.username,
                })),
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((team, index) => ({ ...team, rank: index + 1 }));

        return successResponse(res, {
            id: updatedRoom.id,
            status: updatedRoom.status,
            endTime: updatedRoom.endTime,
            leaderboard,
        }, 'Room ended successfully');
    } catch (error) {
        next(error);
    }
};

// Delete Room
exports.deleteRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        if (room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can delete the room', 403);
        }

        // Allow deleting active rooms (Admin force stop)
        // if (room.status === 'ACTIVE') {
        //     return errorResponse(res, 'Cannot delete an active room', 400);
        // }

        await prisma.room.delete({
            where: { id: roomId },
        });

        // Notify all clients in the room that it has been deleted
        // Ideally this should be handled via the socket service instance, 
        // but since we don't have direct access to io instance here easily without passing it,
        // we might rely on the frontend handling the disconnection or we need to ensure 
        // socket service can broadcast this.
        // Assuming the socket architecture handles room:deleted event if emitted, 
        // or we need to use the req.app.get('io') if available.
        if (req.app.get('io')) {
            req.app.get('io').to(`room:${roomId}`).emit('room:deleted', {
                message: 'Room has been deleted by the host.'
            });
        }

        return successResponse(res, {}, 'Room deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
