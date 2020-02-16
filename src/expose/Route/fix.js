export const originalUrlFix = (originalUrl) => {
  if (originalUrl && originalUrl[originalUrl.length - 1] === '/') {
    return originalUrl.substr(0, originalUrl.length - 1);
  }
  return originalUrl;
};
