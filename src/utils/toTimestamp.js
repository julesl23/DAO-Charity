export const toTimestamp = (strDate) => {
  const dt = Date.parse(strDate)
  return Math.floor(dt / 1000)
}
