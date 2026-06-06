export function getAnnouncementPreview(body: string) {
  const firstLine = body
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean)

  if (!firstLine) return "Open this announcement for full details."
  return firstLine.length > 150 ? `${firstLine.slice(0, 147)}...` : firstLine
}

function cleanLabel(value: string) {
  return value.replace(/^[^A-Za-z0-9]+/, "").trim()
}

export function AnnouncementBody({ body }: { body: string }) {
  const lines = body
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  const details: { label: string; value: string }[] = []
  const bullets: string[] = []
  const paragraphs: string[] = []
  const courtesy: string[] = []

  for (const line of lines) {
    const detailMatch = line.match(/^(.+?):\s*(.+)$/)

    if (/^courtesy:/i.test(line)) {
      courtesy.push(line.replace(/^courtesy:\s*/i, "").trim())
    } else if (line.startsWith("*")) {
      bullets.push(line.replace(/^\*\s*/, "").trim())
    } else if (detailMatch) {
      details.push({ label: cleanLabel(detailMatch[1]), value: detailMatch[2].trim() })
    } else {
      paragraphs.push(line)
    }
  }

  return (
    <div className="space-y-5">
      {paragraphs.length > 0 && (
        <div className="space-y-3 text-[15px] font-medium leading-7 text-slate-700">
          {paragraphs.map((paragraph, index) => (
            <p key={`${paragraph}-${index}`}>{paragraph}</p>
          ))}
        </div>
      )}

      {details.length > 0 && (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {details.map((detail, index) => (
            <div key={`${detail.label}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{detail.label}</p>
              <p className="mt-1 break-words text-sm font-bold text-slate-800">{detail.value}</p>
            </div>
          ))}
        </div>
      )}

      {bullets.length > 0 && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-100 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-600">Contribution Details</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {bullets.map((bullet, index) => (
              <div key={`${bullet}-${index}`} className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-slate-700">
                {bullet}
              </div>
            ))}
          </div>
        </div>
      )}

      {courtesy.length > 0 && (
        <div className="border-t border-slate-200 pt-4 text-sm font-bold text-slate-500">
          Courtesy: {courtesy.join(", ")}
        </div>
      )}
    </div>
  )
}
