export default function _gc(): boolean {
  try {
    global.gc();
    return true;
  } catch (e) {
    return false;
  }
}
