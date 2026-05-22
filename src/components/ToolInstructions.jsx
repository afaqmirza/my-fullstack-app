import { useState } from 'react';
import { ChevronDown, ListOrdered, Lightbulb } from 'lucide-react';
import { TOOL_INSTRUCTIONS } from '../config/toolInstructions';
import './ToolInstructions.css';

export default function ToolInstructions({ toolId }) {
  const [open, setOpen] = useState(true);
  const guide = TOOL_INSTRUCTIONS[toolId];

  if (!guide) return null;

  return (
    <section className="tool-instructions">
      <button
        type="button"
        className="tool-instructions-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <ListOrdered size={20} />
        <span>{guide.title}</span>
        <ChevronDown size={20} className={`chevron ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="tool-instructions-body">
          <ol>
            {guide.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {guide.tip && (
            <p className="tool-instructions-tip">
              <Lightbulb size={16} />
              <span>{guide.tip}</span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
