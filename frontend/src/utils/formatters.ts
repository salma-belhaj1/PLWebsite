export function formatPrice(price: number | string | undefined | null): string {
  const num = Number(price) || 0
  return `${num.toFixed(3)} DT`
}
