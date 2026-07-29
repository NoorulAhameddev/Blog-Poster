import { parseAndSanitizeMarkdown } from "@/lib/markdown";

interface MarkdownRendererProps {
  content: string;
}

export default async function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const sanitizedHtml = await parseAndSanitizeMarkdown(content);

  return (
    <div
      className="prose max-w-none break-words"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
