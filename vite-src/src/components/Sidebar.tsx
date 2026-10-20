
import { useState } from "react";
import {
  ArrowLeftRight,
  Binary,
  Braces,
  ChevronDown,
  Code2,
  FileJson,
  Search,
  type LucideIcon,
} from "lucide-react";

import { categories, tools } from "../data/tools";

type SidebarProps = {
  activeTool: string;
  onSelectTool: (id: string) => void;
};

const icons: Record<string, LucideIcon> = {
  "arrow-left-right": ArrowLeftRight,
  binary: Binary,
  braces: Braces,
  "file-json": FileJson,
};

export default function Sidebar({
  activeTool,
  onSelectTool,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredTools = tools.filter((tool) =>
    `${tool.name} ${tool.description} ${tool.category}`
      .toLowerCase()
      .includes(normalizedQuery),
  );

  function toggleCategory(id: string) {
    setCollapsed((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Code2 size={20} strokeWidth={2.2} />
        </div>

        <div className="brand-text">
          <strong>DevPocket</strong>
          <span>Developer utilities</span>
        </div>

        <span className="brand-version">0.1</span>
      </div>

      <div className="sidebar-search">
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tools"
          aria-label="Search tools"
        />
        <kbd>/</kbd>
      </div>

      <div className="sidebar-section-heading">
        <span>TOOLS</span>
        <span className="tool-total">{filteredTools.length}</span>
      </div>

      <nav className="tool-navigation">
        {categories.map((category) => {
          const categoryTools = filteredTools.filter(
            (tool) => tool.category === category.id,
          );

          if (categoryTools.length === 0) return null;

          const isCollapsed = collapsed.includes(category.id);

          return (
            <section className="nav-category" key={category.id}>
              <button
                type="button"
                className="category-toggle"
                onClick={() => toggleCategory(category.id)}
                aria-expanded={!isCollapsed}
              >
                <span>{category.name}</span>
                <ChevronDown
                  size={14}
                  className={isCollapsed ? "chevron-collapsed" : ""}
                />
              </button>

              {!isCollapsed && (
                <div className="category-tools">
                  {categoryTools.map((tool) => {
                    const Icon = icons[tool.icon] ?? Binary;
                    const isActive = activeTool === tool.id;

                    return (
                      <button
                        type="button"
                        key={tool.id}
                        className={`tool-link ${isActive ? "active" : ""}`}
                        onClick={() => onSelectTool(tool.id)}
                        aria-current={isActive ? "page" : undefined}
                        title={tool.description}
                      >
                        <Icon size={16} strokeWidth={1.8} />
                        <span>{tool.name}</span>
                        {isActive && (
                          <span className="active-indicator" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {filteredTools.length === 0 && (
          <div className="empty-search">
            <Search size={19} />
            <span>No tools found</span>
            <small>Try another keyword.</small>
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-status">
          <span className="status-dot" />
          <span>All systems ready</span>
        </div>
        <div className="footer-meta">DEVPOCKET · VERSION 0.1.0</div>
      </div>
    </aside>
  );
}
