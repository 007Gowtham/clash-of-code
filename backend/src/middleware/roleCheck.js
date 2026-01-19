const { prisma } = require('../config/database');

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
            });
        }

        next();
    };
};

const checkTeamLeader = async (req, res, next) => {
    try {
        const teamId = req.params.teamId || req.body.teamId;

        if (!teamId) {
            return res.status(400).json({
                success: false,
                error: 'Team ID is required',
            });
        }

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { leaderId: true },
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                error: 'Team not found',
            });
        }

        if (team.leaderId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Only team leader can perform this action',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

const checkRoomAdmin = async (req, res, next) => {
    try {
        const roomId = req.params.roomId || req.body.roomId;

        if (!roomId) {
            return res.status(400).json({
                success: false,
                error: 'Room ID is required',
            });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { adminId: true },
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        if (room.adminId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Only room admin can perform this action',
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

const checkTeamMember = async (req, res, next) => {
    try {
        const teamId = req.params.teamId || req.body.teamId;

        const member = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: req.user.id,
                },
            },
        });

        if (!member) {
            return res.status(403).json({
                success: false,
                error: 'You are not a member of this team',
            });
        }

        req.teamMember = member;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error',
        });
    }
};

module.exports = {
    checkRole,
    checkTeamLeader,
    checkRoomAdmin,
    checkTeamMember,
};
