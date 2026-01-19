const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { prisma } = require('./database');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists with Google ID
                    let user = await prisma.user.findUnique({
                        where: { googleId: profile.id },
                    });

                    if (!user) {
                        // Check if email already exists
                        const existingUser = await prisma.user.findUnique({
                            where: { email: profile.emails[0].value },
                        });

                        if (existingUser) {
                            // Link Google account to existing user
                            user = await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    googleId: profile.id,
                                    isEmailVerified: true,
                                },
                            });
                        } else {
                            // Create new user
                            user = await prisma.user.create({
                                data: {
                                    googleId: profile.id,
                                    email: profile.emails[0].value,
                                    username: profile.displayName || profile.emails[0].value.split('@')[0],
                                    isEmailVerified: true,
                                },
                            });
                        }
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    console.log('✅ Google OAuth configured');
} else {
    console.log('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

module.exports = passport;
