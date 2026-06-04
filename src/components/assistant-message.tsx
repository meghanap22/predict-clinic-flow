import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { splitByDoctorNames } from "@/lib/doctor-schedule";

function renderBoldSegments(text: string) {
  const parts: Array<string | { bold: string }> = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ bold: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) return text;

  return parts.map((part, i) =>
    typeof part === "string" ? (
      <Fragment key={i}>{part}</Fragment>
    ) : (
      <span key={i} className="font-semibold text-foreground">
        {part.bold}
      </span>
    ),
  );
}

function renderTextWithDoctors(text: string, onDoctorClick?: () => void) {
  return splitByDoctorNames(text).map((part, i) =>
    part.kind === "text" ? (
      <Fragment key={i}>{renderBoldSegments(part.value)}</Fragment>
    ) : (
      <Link
        key={i}
        to="/patient-flow"
        search={{ doctor: part.doctor.id }}
        onClick={onDoctorClick}
        className="font-semibold text-primary underline-offset-2 hover:underline"
        title={`View ${part.doctor.name}'s schedule · ${part.doctor.sessionLoad}% load`}
      >
        {part.doctor.name}
      </Link>
    ),
  );
}

const BULLET_PREFIX = /^(\*|-|•|\u2022)\s+/;

function stripBulletPrefixes(line: string) {
  let text = line.trim();
  while (BULLET_PREFIX.test(text) || /^\d+\.\s+/.test(text)) {
    text = text.replace(BULLET_PREFIX, "").replace(/^\d+\.\s+/, "");
  }
  return text;
}

export function AssistantMessageContent({
  content,
  onDoctorClick,
}: {
  content: string;
  onDoctorClick?: () => void;
}) {
  const lines = content.split("\n").map((line) => line.trimEnd());

  const blocks: Array<{ type: "p" | "ul"; lines: string[] }> = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "p", lines: [...paragraph] });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ type: "ul", lines: [...list] });
      list = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    const isBullet = BULLET_PREFIX.test(trimmed) || /^\d+\.\s+/.test(trimmed);
    if (isBullet) {
      flushParagraph();
      list.push(stripBulletPrefixes(trimmed));
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }
  flushList();
  flushParagraph();

  if (blocks.length === 0) {
    return (
      <p className="text-sm leading-relaxed">{renderTextWithDoctors(content, onDoctorClick)}</p>
    );
  }

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {blocks.map((block, i) =>
        block.type === "p" ? (
          <p key={i}>{renderTextWithDoctors(block.lines.join(" "), onDoctorClick)}</p>
        ) : (
          <ul key={i} className="list-disc space-y-1.5 pl-4 marker:text-primary">
            {block.lines.map((item, j) => (
              <li key={j} className="pl-0.5">
                {renderTextWithDoctors(item, onDoctorClick)}
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
