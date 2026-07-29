import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123", 12);

  // 1. Create Users
  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      password_hash: passwordHash,
      display_name: "Alice Engineer",
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      password_hash: passwordHash,
      display_name: "Bob Architect",
    },
  });

  // 2. Create Posts
  const post1 = await prisma.post.create({
    data: {
      title: "Building Resilient Microservices with Next.js and Prisma",
      slug: "building-resilient-microservices-nextjs-prisma",
      content: `# Building Resilient Microservices

Microservice architectures require strong contract guarantees, low latency data access, and strict security controls.

## Key Design Principles

1. **Strict Type Safety**: End-to-end TypeScript interfaces.
2. **Database Integrity**: PostgreSQL with Prisma ORM constraints.
3. **Defense in Depth**: HttpOnly JWT cookies and rate-limited endpoints.

\`\`\`typescript
export function calculateLatency(start: number): number {
  return Date.now() - start;
}
\`\`\`

> Production systems prioritize correctness and security above premature optimizations.`,
      status: "published",
      author_id: alice.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Understanding XSS Sanitization in Markdown Publishing",
      slug: "understanding-xss-sanitization-markdown-publishing",
      content: `# XSS Sanitization in Modern Web Apps

Allowing users to submit Markdown presents security risks if unsafe HTML tags like \`<script>\` or \`javascript:\` URIs are evaluated.

By applying **rehype-sanitize** during HTML transformation, dangerous attributes and tags are stripped while preserving formatting.`,
      status: "published",
      author_id: bob.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "Draft: Advanced Database Migration Strategies",
      slug: "draft-advanced-database-migration-strategies",
      content: "Draft content discussing zero-downtime database migrations...",
      status: "draft",
      author_id: alice.id,
    },
  });

  // 3. Create Comments
  await prisma.comment.create({
    data: {
      content: "Great overview of the architecture! The rehype-sanitize pipeline works seamlessly.",
      post_id: post1.id,
      author_id: bob.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Thanks Bob! Security and correctness first.",
      post_id: post1.id,
      author_id: alice.id,
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
