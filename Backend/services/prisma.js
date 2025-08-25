const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
// This file initializes the Prisma Client for database interactions.