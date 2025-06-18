import ReactMarkdown from 'react-markdown';

interface SimpleMarkdownProps {
  content: string;
  className?: string;
}

export function SimpleMarkdown({ content, className = "" }: SimpleMarkdownProps) {
  // Clean the content to ensure proper markdown parsing
  const cleanContent = content.trim();
  
  return (
    <div className={`markdown-content leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          // Style paragraphs with better spacing
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
          ),
          // Style unordered lists
          ul: ({ children }) => (
            <ul className="mb-3 pl-6 space-y-1 list-disc">
              {children}
            </ul>
          ),
          // Style ordered lists
          ol: ({ children }) => (
            <ol className="mb-3 pl-6 space-y-1 list-decimal">
              {children}
            </ol>
          ),
          // Style list items
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          // Style headings
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-3 mt-4 first:mt-0 text-slate-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mb-2 mt-3 first:mt-0 text-slate-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0 text-slate-900">{children}</h3>
          ),
          // Style bold text
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900">{children}</strong>
          ),
          // Style italic text
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          // Style inline code
          code: ({ children }) => (
            <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono text-slate-800">
              {children}
            </code>
          ),
          // Style blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-300 pl-4 my-3 italic text-slate-600">
              {children}
            </blockquote>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
} 