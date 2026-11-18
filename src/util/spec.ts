/** [1,2,3,7,9,10] -> "1-3,7,9-10" */
export const toSpec = (indexes: number[]): string => {
  const s = [...new Set(indexes)].sort((a, b) => a - b)
  const parts: string[] = []
  let i = 0
  while (i < s.length) {
    let j = i
    while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++
    parts.push(i === j ? `${s[i]}` : `${s[i]}-${s[j]}`)
    i = j + 1
  }
  return parts.join(",")
}
