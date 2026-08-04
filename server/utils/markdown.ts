import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/**
 * تحويل Markdown إلى HTML **معقَّم**.
 *
 * التعقيم إلزامي لا اختياري: المحتوى يأتي من نموذج لغوي يعالج نصاً من مصدر
 * خارجي، أي أن مسار «موقع خارجي ← تغذية ← نموذج ← صفحتنا» مسار حقن محتمل.
 * عرضه بـ v-html بلا تعقيم = ثغرة XSS مباشرة.
 */

marked.setOptions({ gfm: true, breaks: true });

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "b", "i", "u", "s",
  "h2", "h3", "h4", "ul", "ol", "li",
  "blockquote", "code", "pre", "a", "hr",
  "table", "thead", "tbody", "tr", "th", "td",
];

export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false }) as string;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    // لا بروتوكولات غير http/https/mailto — يمنع javascript: و data:
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
    FORBID_TAGS: ["style", "script", "iframe", "form", "input", "img"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });
}
