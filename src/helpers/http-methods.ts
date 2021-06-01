import { HttpMethod } from '../typings/find-route';

export default [
  'get',
  'post',
  'put',
  'patch',
  'del',
  'any',
  'head',
  'options',
  'trace'
].map((m) => m.toUpperCase()) as HttpMethod[];
