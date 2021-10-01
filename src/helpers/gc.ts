export default function _gc(): boolean {
  try {
    if (global.gc) {
      global.gc();
    }
    return true;
  } catch (e) {
    return false;
  }
}
