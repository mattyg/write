





export interface Pad {
  author: Uint8Array,
  title: string;
  content: string;
}


export interface PadCreateInput {
  title: string;
}


export interface PadEditInput {
  title: string;
  content: string;
}