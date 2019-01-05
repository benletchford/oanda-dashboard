export function encodeObject(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}
export function decodeObject(obj) {
  return JSON.parse(decodeURIComponent(escape(window.atob(obj))));
}
