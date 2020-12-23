export default function type(contentType) {
  this.writeHeader('Content-Type', contentType);

  return this;
}
