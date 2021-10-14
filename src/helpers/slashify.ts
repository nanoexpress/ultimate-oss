export default (path: string): string =>
  path !== '*' &&
  path.charAt(path.length - 1) !== '/' &&
  path.charAt(path.length - 1) !== '*' &&
  (path.lastIndexOf('.') === -1 || path.lastIndexOf('.') < path.length - 4)
    ? `${path}/`
    : path;
