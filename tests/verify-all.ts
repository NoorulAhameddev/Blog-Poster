import { hashPassword, comparePassword } from "../src/lib/password";
import { signToken, verifyToken } from "../src/lib/auth";
import { registerSchema, loginSchema, postSchema, commentSchema, paginationSchema } from "../src/lib/validations";
import { parseAndSanitizeMarkdown } from "../src/lib/markdown";
import { checkRateLimit } from "../src/lib/rate-limit";
import { paginatedResponse, errorResponse } from "../src/lib/api-response";

async function runVerificationSuite() {
  console.log("==========================================");
  console.log("  PRODUCTION SECURITY & LOGIC TEST SUITE");
  console.log("==========================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
    }
  }

  // 1. Password Hashing (Bcrypt Cost Factor 12)
  console.log("--- 1. Password Security & Hashing ---");
  const rawPass = "SecretPass123";
  const hash = await hashPassword(rawPass);
  assert(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$"), "Bcrypt hash uses cost factor 12");

  const matches = await comparePassword(rawPass, hash);
  assert(matches === true, "Password comparison returns true for correct credentials");

  const wrongMatches = await comparePassword("WrongPass123", hash);
  assert(wrongMatches === false, "Password comparison returns false for incorrect credentials");

  // 2. Password Schema Validation Rules
  console.log("\n--- 2. Zod Password Policy Rules ---");
  const validReg = registerSchema.safeParse({ email: "user@test.com", password: "Password123", display_name: "Test User" });
  assert(validReg.success === true, "Valid password passes registration schema");

  const shortPass = registerSchema.safeParse({ email: "user@test.com", password: "Pass1", display_name: "Test User" });
  assert(shortPass.success === false, "Short password (<8 chars) is rejected");

  const noNumberPass = registerSchema.safeParse({ email: "user@test.com", password: "PasswordOnly", display_name: "Test User" });
  assert(noNumberPass.success === false, "Password with no numbers is rejected");

  const noLetterPass = registerSchema.safeParse({ email: "user@test.com", password: "1234567890", display_name: "Test User" });
  assert(noLetterPass.success === false, "Password with no letters is rejected");

  // 3. JWT Signing & Verification
  console.log("\n--- 3. JWT Token Verification ---");
  const payload = { id: "test-uuid-1234", email: "jwt@test.com", display_name: "JWT Tester" };
  const token = signToken(payload);
  assert(typeof token === "string" && token.length > 20, "JWT token signed successfully");

  const decoded = verifyToken(token);
  assert(decoded !== null && decoded.id === payload.id && decoded.email === payload.email, "JWT payload verified correctly");

  const invalidDecoded = verifyToken("invalid.jwt.token");
  assert(invalidDecoded === null, "Malformed JWT returns null on verification");

  // 4. Markdown XSS Protection (rehype-sanitize)
  console.log("\n--- 4. Markdown XSS Protection ---");
  const maliciousMarkdown = `# Safe Title\n\n<script>alert('XSS Attack!')</script>\n\n[Malicious Link](javascript:alert('XSS'))\n\n<img src="x" onerror="alert('XSS')" />`;
  const sanitizedHtml = await parseAndSanitizeMarkdown(maliciousMarkdown);

  assert(!sanitizedHtml.includes("<script>"), "Markdown parser strips <script> tags");
  assert(!sanitizedHtml.includes("onerror="), "Markdown parser strips inline onerror event handlers");
  assert(!sanitizedHtml.includes("javascript:"), "Markdown parser strips javascript: pseudo-protocol URIs");
  assert(sanitizedHtml.includes("Safe Title"), "Markdown parser preserves safe text content");

  // 5. Rate Limiter Checks
  console.log("\n--- 5. IP Rate Limiting ---");
  const testIp = "192.168.1.100";
  let rateLimitResult;
  for (let i = 1; i <= 10; i++) {
    rateLimitResult = checkRateLimit(`test-route:${testIp}`, 10, 60000);
  }
  assert(rateLimitResult?.success === true, "Allowed 10 requests within limit");

  const rateLimitExceeded = checkRateLimit(`test-route:${testIp}`, 10, 60000);
  assert(rateLimitExceeded.success === false, "Rejected 11th request (429 Rate Limit Exceeded)");

  // 6. Pagination Schema & Response Format
  console.log("\n--- 6. Pagination & API Format ---");
  const validPage = paginationSchema.parse({ page: "2", limit: "15" });
  assert(validPage.page === 2 && validPage.limit === 15, "Coerces page and limit string query params");

  const overLimitPage = paginationSchema.safeParse({ page: "1", limit: "100" });
  assert(overLimitPage.success === false, "Limits pagination max limit to 50");

  console.log("\n==========================================");
  console.log(`  VERIFICATION COMPLETED: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("==========================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerificationSuite().catch((err) => {
  console.error("Verification suite execution error:", err);
  process.exit(1);
});
