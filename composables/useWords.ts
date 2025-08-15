import { ref, computed } from "vue";
import { useRuntimeConfig } from "#app";
import words from "~/data/words.json";

type Word = {
  id: string;
  word: string;
  ordklasse?: string;
  boyninger?: string;
  tilleggsinformasjon?: string;
  definitions: string[];
  definition: string;
};

function parseCsv(text: string): Word[] {
  // Robust CSV parsing supporting quoted fields and commas/newlines inside quotes
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }
    if (ch === "\n" && !inQuotes) {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      continue;
    }
    // ignore carriage returns
    if (ch === "\r") continue;
    cur += ch;
  }
  if (cur !== "" || row.length) {
    row.push(cur);
    rows.push(row);
  }

  const norm = rows.map((r) => r.map((c) => c.trim()));
  if (norm.length === 0) return [];

  const headerKeywords = [
    "tittel",
    "tittel på ord",
    "ordklasse",
    "definisjon",
    "definition",
    "word",
  ];
  let headerIndex = norm.findIndex((r) =>
    r.some((cell) => {
      const lc = cell.toLowerCase();
      return headerKeywords.some((k) => lc.includes(k));
    })
  );
  if (headerIndex === -1) headerIndex = 0;

  const headers = norm[headerIndex].map((h) => h.toLowerCase());
  const dataRows = norm
    .slice(headerIndex + 1)
    .filter((r) => r.some((c) => c !== ""));

  // helper to find definition-like columns and sort them by number if present
  const defCols = headers
    .map((h, idx) => ({ h, idx }))
    .filter((x) => x.h.includes("definisjon") || x.h.includes("definition"))
    .sort((a, b) => {
      const na = (a.h.match(/(\d+)/) || [])[0] || "0";
      const nb = (b.h.match(/(\d+)/) || [])[0] || "0";
      return Number(na) - Number(nb);
    });

  return dataRows.map((cols) => {
    const record: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++)
      record[headers[i]] = (cols[i] ?? "").toString();

    const id = record["id"] ?? record["#"] ?? cols[0] ?? "";
    const title =
      record["tittel på ord"] ??
      record["tittel"] ??
      record["title"] ??
      record["word"] ??
      cols[0] ??
      "";
    const ordklasse = record["ordklasse"] ?? record["ordklasse:"] ?? "";
    const boyninger =
      record["bøyninger"] ?? record["bøyning"] ?? record["variants"] ?? "";
    const tilleggs =
      record["tilleggsinformasjon"] ??
      record["tilleggsinfo"] ??
      record["tilleggsinformasjon:"] ??
      "";

    const defs: string[] = [];
    for (const d of defCols) {
      const v = record[d.h];
      if (v) defs.push(v);
    }
    if (defs.length === 0 && (record["definition"] || record["definisjon"]))
      defs.push(record["definition"] ?? record["definisjon"]);

    return {
      id: id.toString(),
      word: title.toString(),
      ordklasse: ordklasse.toString(),
      boyninger: boyninger.toString(),
      tilleggsinformasjon: tilleggs.toString(),
      definitions: defs,
      definition: defs[0] ?? "",
    } as Word;
  });
}

export function useWords() {
  const items = ref<Word[]>(words as Word[]);
  const query = ref("");

  const results = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return items.value;
    return items.value.filter((w) => {
      if (w.word && w.word.toLowerCase().includes(q)) return true;
      if (w.ordklasse && w.ordklasse.toLowerCase().includes(q)) return true;
      if (w.boyninger && w.boyninger.toLowerCase().includes(q)) return true;
      if (
        w.tilleggsinformasjon &&
        w.tilleggsinformasjon.toLowerCase().includes(q)
      )
        return true;
      if (w.definition && w.definition.toLowerCase().includes(q)) return true;
      if (
        w.definitions &&
        w.definitions.some((d) => d.toLowerCase().includes(q))
      )
        return true;
      return false;
    });
  });

  // Try loading a published Google Sheets CSV if configured. Falls back to local data.
  try {
    const config = useRuntimeConfig();
    const url = config.public?.googleSheetCsvUrl;
    if (url) {
      (async () => {
        try {
          const normalizeGoogleSheetUrl = (u: string) => {
            try {
              if (!u.includes("docs.google.com/spreadsheets")) return u;
              if (u.includes("/export") || u.includes("output=csv")) return u;
              const parsed = new URL(u);
              const m = parsed.pathname.match(/\/d\/([^/]+)/);
              const id = m ? m[1] : parsed.searchParams.get("id");
              let gid = parsed.searchParams.get("gid");
              if (!gid && parsed.hash) {
                const frag = parsed.hash.replace(/^#/, "");
                const kv = new URLSearchParams(frag);
                gid = kv.get("gid");
              }
              if (!id) return u;
              let out = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
              if (gid) out += `&gid=${encodeURIComponent(gid)}`;
              return out;
            } catch (e) {
              return u;
            }
          };

          const fetchUrl = normalizeGoogleSheetUrl(String(url));
          const res = await fetch(fetchUrl);
          if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
          const text = await res.text();
          const parsed = parseCsv(text);
          if (parsed.length) items.value = parsed;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("useWords: failed to fetch remote sheet", e);
        }
      })();
    }
  } catch (e) {
    // ignore in uncommon contexts
  }

  return { items, query, results };
}
