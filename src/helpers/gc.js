export default function _gc() {
  try {
    global.gc();
    return true;
  } catch (e) {
    return false;
  }
}
