import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import privacyEn from "../../privacy-policy.md?raw";
import refundEn from "../../refund-policy.md?raw";
import termsEn from "../../terms-and-conditions.md?raw";
import privacyBn from "../../privacy-policy.bn.md?raw";
import refundBn from "../../refund-policy.bn.md?raw";
import termsBn from "../../terms-and-conditions.bn.md?raw";

type Lang = "bn" | "en";
type PolicySlug = "privacy-policy" | "refund-policy" | "terms-and-conditions";

type PolicyData = {
  title: { bn: string; en: string };
  content: { bn: string; en: string };
};

const POLICIES: Record<PolicySlug, PolicyData> = {
  "privacy-policy": {
    title: { bn: "প্রাইভেসি পলিসি", en: "Privacy Policy" },
    content: { bn: privacyBn, en: privacyEn },
  },
  "refund-policy": {
    title: { bn: "রিফান্ড ও বাতিল নীতি", en: "Refund & Cancellation Policy" },
    content: { bn: refundBn, en: refundEn },
  },
  "terms-and-conditions": {
    title: { bn: "টার্মস অ্যান্ড কন্ডিশনস", en: "Terms & Conditions" },
    content: { bn: termsBn, en: termsEn },
  },
};

const UI = {
  bn: {
    home: "হোমে ফিরুন",
    notFoundTitle: "পেজ পাওয়া যায়নি",
    notFoundText: "দুঃখিত, আপনি যে নীতিমালা পেজটি খুঁজছেন সেটি পাওয়া যায়নি।",
    languageBtn: "EN",
    backToSite: "মূল সাইটে ফিরে যান",
  },
  en: {
    home: "Back to Home",
    notFoundTitle: "Page not found",
    notFoundText: "Sorry, the policy page you requested was not found.",
    languageBtn: "বাং",
    backToSite: "Return to main site",
  },
} as const;

type InlinePart =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "link"; label: string; href: string };

function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const token =
    /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = token.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", value: text.slice(last, m.index) });
    }
    const v = m[0];
    if (v.startsWith("**") && v.endsWith("**")) {
      parts.push({ type: "bold", value: v.slice(2, -2) });
    } else if (v.startsWith("*") && v.endsWith("*")) {
      parts.push({ type: "italic", value: v.slice(1, -1) });
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(v);
      if (link) {
        parts.push({ type: "link", label: link[1], href: link[2] });
      } else {
        parts.push({ type: "text", value: v });
      }
    }
    last = m.index + v.length;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts;
}

function renderInline(text: string, keyPrefix: string): React.ReactNode {
  return parseInline(text).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.type === "bold") return <strong key={key}>{part.value}</strong>;
    if (part.type === "italic") return <em key={key}>{part.value}</em>;
    if (part.type === "link") {
      const external = /^https?:\/\//.test(part.href);
      return (
        <a
          key={key}
          href={part.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          {part.label}
        </a>
      );
    }
    return <span key={key}>{part.value}</span>;
  });
}

function parseTable(lines: string[]): { headers: string[]; rows: string[][] } {
  const toCells = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());

  const headers = lines[0] ? toCells(lines[0]) : [];
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = toCells(lines[i]);
    const isDivider = cells.every((c) => /^:?-{3,}:?$/.test(c));
    if (isDivider) continue;
    rows.push(cells);
  }
  return { headers, rows };
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  const isSpecialLine = (line: string) =>
    line.startsWith("# ") ||
    line.startsWith("## ") ||
    line.startsWith("### ") ||
    line.startsWith("- ") ||
    line.startsWith("|") ||
    line.startsWith("> ") ||
    line.trim() === "---";

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.trim() === "---") {
      out.push(<hr key={`hr-${blockKey++}`} className="my-6 border-border" />);
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      out.push(
        <h1 key={`h1-${blockKey++}`} className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          {renderInline(line.slice(2).trim(), `h1-${blockKey}`)}
        </h1>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      out.push(
        <h2 key={`h2-${blockKey++}`} className="mt-7 text-xl font-bold sm:text-2xl">
          {renderInline(line.slice(3).trim(), `h2-${blockKey}`)}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      out.push(
        <h3 key={`h3-${blockKey++}`} className="mt-6 text-lg font-bold">
          {renderInline(line.slice(4).trim(), `h3-${blockKey}`)}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2).trim());
        i++;
      }
      out.push(
        <ul key={`ul-${blockKey++}`} className="ml-5 list-disc space-y-2 text-sm leading-7 sm:text-base">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `li-${blockKey}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const table = parseTable(tableLines);
      out.push(
        <div key={`tbl-${blockKey++}`} className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                {table.headers.map((h, idx) => (
                  <th key={idx} className="border-b border-border px-4 py-2.5 font-semibold">
                    {renderInline(h, `th-${blockKey}-${idx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border/70 last:border-b-0">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2.5 align-top">
                      {renderInline(cell, `td-${blockKey}-${rowIdx}-${cellIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith("> ")) {
      const quotes: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quotes.push(lines[i].trim().slice(2).trim());
        i++;
      }
      out.push(
        <blockquote key={`q-${blockKey++}`} className="rounded-r-lg border-l-4 border-primary bg-accent/20 px-4 py-3 text-sm leading-7">
          {quotes.map((q, idx) => (
            <p key={idx}>{renderInline(q, `q-${blockKey}-${idx}`)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const candidate = lines[i].trim();
      if (!candidate) break;
      if (isSpecialLine(candidate)) break;
      para.push(candidate);
      i++;
    }
    out.push(
      <p key={`p-${blockKey++}`} className="text-sm leading-7 text-foreground/95 sm:text-base">
        {renderInline(para.join(" "), `p-${blockKey}`)}
      </p>
    );
  }

  return out;
}

export default function PolicyPage() {
  const location = useLocation();
  const [lang, setLang] = useState<Lang>("bn");
  const ui = UI[lang];
  const slug = location.pathname.replace(/^\/+/, "") as PolicySlug;
  const policy = (slug && slug in POLICIES ? POLICIES[slug] : null) as PolicyData | null;

  const content = useMemo(() => {
    if (!policy) return [];
    return renderMarkdown(policy.content[lang]);
  }, [lang, policy]);

  if (!policy) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-bold">{ui.notFoundTitle}</h1>
        <p className="mt-2 text-muted-foreground">{ui.notFoundText}</p>
        <Button asChild className="mt-6">
          <Link to="/">{ui.backToSite}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <Button variant="outline" asChild className="h-10 gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {ui.home}
            </Link>
          </Button>
          <button
            onClick={() => setLang((v) => (v === "bn" ? "en" : "bn"))}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-accent"
            )}
            aria-label="Switch language"
          >
            <Globe className="h-3.5 w-3.5" />
            {ui.languageBtn}
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
        <article className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{policy.title[lang]}</h1>
          <div className="my-2 border-t border-border" />
          <div className="space-y-4">{content}</div>
        </article>
      </section>
    </main>
  );
}

