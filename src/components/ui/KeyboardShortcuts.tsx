export function KeyboardShortcuts() {
  return (
    <div className="fixed bottom-4 right-4 text-sm text-gray-500">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="font-medium mb-2">Keyboard Shortcuts:</p>
        <ul className="space-y-1">
          <li>
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Enter</kbd>
            <span className="ml-2">Submit order</span>
          </li>
          <li>
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Esc</kbd>
            <span className="ml-2">Cancel edit</span>
          </li>
          <li>
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">⌘</kbd>
            +
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Z</kbd>
            <span className="ml-2">Undo</span>
          </li>
          <li>
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">⌘</kbd>
            +
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">⇧</kbd>
            +
            <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Z</kbd>
            <span className="ml-2">Redo</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 