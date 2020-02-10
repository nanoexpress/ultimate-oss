export default function send(response) {
  if (this.serialize) {
    return this.end(this.serialize(response));
  } else if (typeof response === 'object') {
    return this.end(JSON.stringify(response));
  } else {
    return this.end(response);
  }
}
