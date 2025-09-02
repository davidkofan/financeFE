export function generate24CharGUID() {
  const chars = 'abcdef0123456789';
  let guid = '';
  for (let i = 0; i < 24; i++) {
    guid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return guid;
}
