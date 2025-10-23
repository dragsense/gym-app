#!/usr/bin/env node

const crypto = require('crypto');

console.log('=== SECURE SECRET KEY GENERATOR ===\n');

// Generate OTP Secret (32 bytes)
const otpSecret = crypto.randomBytes(32).toString('hex');
console.log('OTP_SECRET=' + otpSecret);

// Generate Cookie Secret (32 bytes)
const cookieSecret = crypto.randomBytes(32).toString('hex');
console.log('COOKIE_SECRET=' + cookieSecret);

// Generate JWT Secret (64 bytes)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Generate JWT Refresh Secret (64 bytes)
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_REFRESH_SECRET=' + jwtRefreshSecret);

// Generate Encryption Key (32 bytes base64)
const encryptionKey = crypto.randomBytes(32).toString('base64');
console.log('ENCRYPTION_KEY=' + encryptionKey);

console.log('\n=== COPY THESE VALUES TO YOUR .env FILE ===');
console.log('⚠️  Keep these secrets secure and never commit them to version control!');


