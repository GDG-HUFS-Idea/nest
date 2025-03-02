export const generateNanoId = (len: number = 21) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((byte) => chars[byte % chars.length])
    .join('')
}
