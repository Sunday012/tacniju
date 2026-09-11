export type ContentRecordType = "lyrics" | "teachings" | "prophecies" | "memos"

export const contentRecordLabels: Record<ContentRecordType, { singular: string; plural: string; owner: string }> = {
  lyrics: { singular: "Lyric", plural: "Lyrics", owner: "Writer" },
  teachings: { singular: "Teaching", plural: "Teachings", owner: "Teacher" },
  prophecies: { singular: "Prophecy", plural: "Prophecies", owner: "Speaker" },
  memos: { singular: "Memo", plural: "Memos", owner: "Author" },
}

export function isContentRecordType(value: string): value is ContentRecordType {
  return value === "lyrics" || value === "teachings" || value === "prophecies" || value === "memos"
}
