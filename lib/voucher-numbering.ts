export const voucherPrefixes: Record<string, string> = {
  Sales: "SV",
  Purchase: "PV",
  Receipt: "RV",
  Contra: "CNT",
  Payment: "PAY",
  Expense: "EXP",
  Levy: "LEV",
  Income: "INC",
  Program: "PRG",
}

export function getVoucherPrefix(voucherType: string) {
  return voucherPrefixes[voucherType] || voucherType.slice(0, 3).toUpperCase()
}

export function getVoucherNumberValue(voucherNo: string | null | undefined, prefix: string) {
  if (!voucherNo) return 0
  const match = voucherNo.match(new RegExp(`^${prefix}-(\\d+)$`, "i"))
  if (match?.[1]) return Number(match[1]) || 0

  const legacyParts = voucherNo.split("-")
  if (legacyParts.length === 2) return Number(legacyParts[1]) || 0
  return 0
}

export function getNextVoucherNo(voucherType: string, vouchers: Array<{ voucher_no?: string | null }>) {
  const prefix = getVoucherPrefix(voucherType)
  const lastNumber = vouchers.reduce((max, voucher) => {
    return Math.max(max, getVoucherNumberValue(voucher.voucher_no, prefix))
  }, 0)

  return `${prefix}-${String(lastNumber + 1).padStart(5, "0")}`
}
