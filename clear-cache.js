#!/usr/bin/env node

/**
 * Script to clear Node.js module cache for OAuth and SMTP related modules
 * Run this if you're experiencing caching issues: node clear-cache.js
 */

console.log('🧹 Clearing Node.js module cache...');

// Clear OAuth-related cache
const oauthPaths = [
    './ghost/core/core/server/api/endpoints/oauth-middleware.js',
    './ghost/core/core/server/api/endpoints/oauth.js'
];

// Clear SMTP-related cache
const smtpPaths = [
    './ghost/core/core/server/services/mail/GhostMailer.js'
];

// Clear auth-related cache
const authPaths = [
    './ghost/core/core/server/services/auth',
    './ghost/core/core/server/models'
];

const allPaths = [...oauthPaths, ...smtpPaths, ...authPaths];

allPaths.forEach(path => {
    try {
        const resolvedPath = require.resolve(path);
        delete require.cache[resolvedPath];
        console.log(`✅ Cleared cache for: ${path}`);
    } catch (error) {
        console.log(`⚠️  Could not clear cache for: ${path} (may not exist)`);
    }
});

console.log('');
console.log('🎉 Cache clearing complete!');
console.log('');
console.log('Next steps:');
console.log('1. Restart your Ghost core server');
console.log('2. Try the OAuth flow again');

process.exit(0);