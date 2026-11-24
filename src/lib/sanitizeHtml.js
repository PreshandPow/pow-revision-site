import DOMPurify from 'dompurify';

// Cleans saved Tiptap HTML before it is shown with dangerouslySetInnerHTML.
// Keeps normal formatting (bold, headings, colours, images) but strips anything
// that could run code, e.g. <script> tags or onerror="..." attributes.
export function sanitizeHtml(html = '') {
    // DOMPurify needs a browser. On the server it can't clean anything,
    // so return nothing rather than unsafe HTML.
    if (!DOMPurify.isSupported) return '';
    return DOMPurify.sanitize(html);
}
