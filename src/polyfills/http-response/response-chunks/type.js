export default function type(type) {
  this.writeHeader('Content-Type', type);

  return this;
}
