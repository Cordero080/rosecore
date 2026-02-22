// syntaxHighlight.jsx - ADD-friendly syntax highlighting with calming colors
// Gold for keywords, baby blue for strings, soft crimson for output/comments

import React from 'react';

// Calming color palette for ADD-friendly reading
const COLORS = {
  keyword: '#d4a574',      // Warm gold/tan
  string: '#7ec8e3',       // Baby blue  
  comment: '#e57373',      // Soft crimson/coral for output
  number: '#c9a8ff',       // Soft purple
  function: '#81c784',     // Soft green
  operator: '#b0bec5',     // Muted gray
  default: '#e0e0e0',      // Light gray for default text
};

// Light mode colors - adjusted for white background
const COLORS_LIGHT = {
  keyword: '#b5651d',      // Darker gold/amber
  string: '#0277bd',       // Darker blue
  comment: '#c62828',      // Darker crimson for output
  number: '#7c4dff',       // Darker purple
  function: '#2e7d32',     // Darker green
  operator: '#546e7a',     // Darker gray
  default: '#37474f',      // Dark gray for default text
};

// Keywords to highlight
const KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 
  'do', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'new',
  'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch',
  'throw', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined',
  'this', 'of', 'in'
];

// Tokenize and highlight code
export function highlightCode(code, isLightMode = false) {
  if (!code) return null;
  
  const colors = isLightMode ? COLORS_LIGHT : COLORS;
  const lines = code.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Check if line is a comment (output)
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('//')) {
      return (
        <span key={lineIndex}>
          <span className="syntax-comment" style={{ color: colors.comment }}>
            {line}
          </span>
          {lineIndex < lines.length - 1 && '\n'}
        </span>
      );
    }
    
    // Tokenize the line
    const tokens = tokenizeLine(line);
    
    return (
      <span key={lineIndex}>
        {tokens.map((token, tokenIndex) => {
          const style = getTokenStyle(token, colors);
          return (
            <span key={tokenIndex} className={`syntax-${token.type}`} style={style}>
              {token.value}
            </span>
          );
        })}
        {lineIndex < lines.length - 1 && '\n'}
      </span>
    );
  });
}

// Simple tokenizer
function tokenizeLine(line) {
  const tokens = [];
  let i = 0;
  
  while (i < line.length) {
    // Skip whitespace but include it
    if (/\s/.test(line[i])) {
      let ws = '';
      while (i < line.length && /\s/.test(line[i])) {
        ws += line[i];
        i++;
      }
      tokens.push({ type: 'whitespace', value: ws });
      continue;
    }
    
    // Inline comment
    if (line.slice(i, i + 2) === '//') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }
    
    // String (single or double quotes)
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1];
          i += 2;
        } else {
          str += line[i];
          i++;
        }
      }
      if (i < line.length) {
        str += line[i];
        i++;
      }
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // Number
    if (/[0-9]/.test(line[i])) {
      let num = '';
      while (i < line.length && /[0-9.]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    
    // Word (identifier or keyword)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let word = '';
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }
      
      // Check if it's a keyword
      if (KEYWORDS.includes(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (i < line.length && line[i] === '(') {
        // It's a function call
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'identifier', value: word });
      }
      continue;
    }
    
    // Operator or punctuation
    tokens.push({ type: 'operator', value: line[i] });
    i++;
  }
  
  return tokens;
}

// Get style for token type
function getTokenStyle(token, colors) {
  switch (token.type) {
    case 'keyword':
      return { color: colors.keyword, fontWeight: 600 };
    case 'string':
      return { color: colors.string };
    case 'comment':
      return { color: colors.comment, fontStyle: 'italic' };
    case 'number':
      return { color: colors.number };
    case 'function':
      return { color: colors.function };
    case 'operator':
      return { color: colors.operator };
    default:
      return { color: colors.default };
  }
}

// React component wrapper
export function SyntaxHighlight({ code, className = '' }) {
  // Check for light mode via data-theme attribute
  const [isLightMode, setIsLightMode] = React.useState(false);
  
  React.useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.documentElement.getAttribute('data-theme') === 'light');
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <pre className={`syntax-highlighted ${className}`}>
      <code>{highlightCode(code, isLightMode)}</code>
    </pre>
  );
}

export default SyntaxHighlight;
