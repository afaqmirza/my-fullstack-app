import { Outlet, useLocation } from 'react-router-dom';
import ToolInstructions from './ToolInstructions';
import { getToolIdFromPath } from '../config/toolRouteIds';

/** Wraps all /tools/* pages: pale oak background + how-to guide */
export default function ToolChrome() {
  const { pathname } = useLocation();
  const toolId = getToolIdFromPath(pathname);

  return (
    <div className="tool-page-surface">
      <Outlet />
      {toolId && (
        <section className="tool-guide-section">
          <ToolInstructions toolId={toolId} />
        </section>
      )}
    </div>
  );
}
