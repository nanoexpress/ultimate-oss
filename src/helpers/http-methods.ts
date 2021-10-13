import { HttpMethod } from '../../types/nanoexpress';

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
