import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolHeaderProps {
  title: string;
  children?: ReactNode;
}

export function ToolHeader({ title, children }: ToolHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-6 backdrop-blur-md">
      <Link to="/tools" className="group flex shrink-0 items-center gap-2 text-white/60 transition-colors hover:text-white">
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden text-sm font-medium uppercase tracking-wider sm:block">Back to Tools</span>
      </Link>
      <h1 className="mr-auto border-l border-white/10 pl-4 text-sm font-semibold uppercase tracking-wider text-white sm:pl-5">
        {title}
      </h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
