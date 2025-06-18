export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-slate-500 ml-2">MediPal is typing...</span>
    </div>
  );
} 