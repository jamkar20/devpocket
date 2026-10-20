
import { useEffect, useState } from "react";
import {
  Check,
  Moon,
  Sun,
  Monitor,
  Settings2,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import { tools } from "./data/tools";
import DecimalHexTool from "./tools/DecimalHexTool";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem("devpocket-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Use the default theme if storage is unavailable.
  }

  return "dark";
}

export default function App() {
  const [activeTool, setActiveTool] = useState("decimal-hex");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const selectedTool = tools.find(
    (tool) => tool.id === activeTool,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("devpocket-theme", theme);
    } catch {
      // The current theme still works for this session.
    }
  }, [theme]);

  return (
    <div className="app-shell">
      <Sidebar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
      />

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Tools</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{selectedTool?.name ?? "Workspace"}</strong>
          </div>

          <div className="topbar-actions">
            <span className="runtime-status">
              <span className="status-dot" />
              Ready
            </span>

            <div className="topbar-divider" />

            <button
              type="button"
              className="icon-button"
              onClick={() =>
                setTheme((current) =>
                  current === "dark" ? "light" : "dark",
                )
              }
              aria-label={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              title={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
            >
              {theme === "dark" ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </button>
          </div>
        </header>

        <div className="content-scroll">
          <section className="content-area">
            <div className="page-heading">
              <div className="page-title-group">
                <div className="eyebrow">DEVELOPER TOOLKIT</div>
                <h1>{selectedTool?.name ?? "Developer Tools"}</h1>
                <p>
                  {selectedTool?.description ??
                    "Small tools for everyday development tasks."}
                </p>
              </div>

              <div className="page-actions">
                <span className="tool-type">
                  <Check size={13} />
                  Local tool
                </span>
              </div>
            </div>

            <div className="workspace-panel">
              <div className="panel-header">
                <div>
                  <h2>Workspace</h2>
                  <p>
                    {selectedTool?.description ??
                      "Your selected tool is available here."}
                  </p>
                </div>

                <Settings2
                  size={17}
                  className="panel-header-icon"
                />
              </div>

              <div className="workspace-tool-content">
                {activeTool === "decimal-hex" ? (
                  <DecimalHexTool />
                ) : (
                  <div className="workspace-empty">
                    <div className="empty-icon">
                      <Monitor
                        size={23}
                        strokeWidth={1.6}
                      />
                    </div>

                    <h3>Coming soon</h3>
                    <p>
                      This tool has not been implemented yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bottom-note">
              <span>DevPocket</span>
              <span>•</span>
              <span>Built for developers</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
