import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

/**
 * Converts Markdown string into safe, sanitized HTML string.
 * Strips script tags, unsafe inline event handlers, and javascript: URLs.
 */
export async function parseAndSanitizeMarkdown(content: string): Promise<string> {
  if (!content) return "";
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content);

  return String(file);
}
