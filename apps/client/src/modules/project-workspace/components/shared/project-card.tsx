import { Button } from "antd";

interface ProjectCardProps {
  actionText: string;
  desc: string;
  meta: string[];
  onAction: () => void;
  title: string;
}

function ProjectCard({
  actionText,
  desc,
  meta,
  onAction,
  title,
}: ProjectCardProps) {
  return (
    <article className="rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)]">
      <div className="flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ide-text)]">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--ide-text-muted)]">
            {desc}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {meta.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2 py-0.5 text-[10px] text-[var(--ide-text-muted)]"
              >
                {item}
              </span>
            ))}
          </div>
          <Button
            size="small"
            type="primary"
            onClick={onAction}
            className="!rounded-sm"
          >
            {actionText}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
