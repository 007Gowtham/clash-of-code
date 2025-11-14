import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import {prisma }from '../db/index.js';
import { LoginTypesEnum, UserRolesEnum,AvailableLoginTypes, } from '../constants.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../logger/winston.logger.js';

logger.info('Setting up GitHub strategy');

try {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (_, __, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new ApiError(400, 'Email not provided by GitHub'), null);

          let user = await prisma.user.findUnique({ where: { email } });

          if (user) {
            logger.info('Existing user found for GitHub OAuth login');
            if (user.loginType !== LoginTypesEnum.GITHUB_OAUTH) {
              logger.warn(`Login type mismatch: expected ${user.loginType}, got ${LoginTypesEnum.GITHUB}`);
              return done(new ApiError(400, `Please login using ${user.loginType}`), null);
            }

            logger.info('Existing user logged in via GitHub OAuth');
            return done(null, user);
          }

          logger.info('Registering new user via GitHub OAuth');

          const newUser = await prisma.user.create({
            data: {
              name: profile.username,
              email: email,
              password: profile._json.node_id, // You can later replace this with random token
              role: UserRolesEnum.USER,
              loginType: LoginTypesEnum.GITHUB_OAUTH,
              isEmailVerified: true,
            },
          });
          logger.info('New user registered via GitHub OAuth', newUser);

          return done(null, newUser);
        } catch (error) {
          logger.error('Error in GitHub OAuth strategy:', error);
          return done(error, null);
        }
      }
    )
  );
} catch (err) {
  console.error('Error setting up GitHub strategy:', err);
}

// Google OAuth Strategy
logger.info('Setting up Google strategy');

try {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (_, __, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new ApiError(400, 'Email not provided by Google'), null);

          let user = await prisma.user.findUnique({ where: { email } });

          if (user) {
            logger.info('Existing user found for Google OAuth login');
            if (user.loginType !== LoginTypesEnum.GOOGLE_OAUTH) {
              logger.warn(`Login type mismatch: expected ${user.loginType}, got ${LoginTypesEnum.GOOGLE_OAUTH}`);
              return done(new ApiError(400, `Please login using ${user.loginType}`), null);
            }

            logger.info('Existing user logged in via Google OAuth');
            return done(null, user);
          }

          logger.info('Registering new user via Google OAuth');

          const newUser = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: email,
              password: profile.id, // You can later replace this with random token
              role: UserRolesEnum.USER,
              loginType: LoginTypesEnum.GOOGLE_OAUTH,
              isEmailVerified: true,
              avatar: profile.photos?.[0]?.value
            },
          });
          logger.info('New user registered via Google OAuth');

          return done(null, newUser);
        } catch (error) {
          logger.error('Error in Google OAuth strategy:', error);
          return done(error, null);
        }
      }
    )
  );
} catch (err) {
  console.error('Error setting up Google strategy:', err);
}
