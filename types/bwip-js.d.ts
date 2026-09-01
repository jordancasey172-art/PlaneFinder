declare module "bwip-js" {
  export interface ToBufferOptions {
    bcid: string;
    text: string;
    scale?: number;
    includecheck?: boolean;
    textxalign?: string;
    includetext?: boolean;
    textfont?: string;
    textsize?: number;
    height?: number;
    width?: number;
    rotate?: string;
    backgroundcolor?: string;
    [key: string]: unknown;
  }

  export function toBuffer(opts: ToBufferOptions): Promise<Buffer>;

  const bwipJs: { toBuffer: typeof toBuffer };
  export default bwipJs;
}
