import {
  BlockMode,
  IBlock
} from '@nanoexpress/route-syntax-parser/types/interfaces';

export default (blocks: IBlock[]): BlockMode[] => {
  return [...new Set(blocks.map((block) => block.mode))];
};
