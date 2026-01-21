
export enum NodeType {
  MEDIA = 'MEDIA',
  IMAGE_GEN = 'IMAGE_GEN',
  CAMERA = 'CAMERA',
  VIDEO_GEN = 'VIDEO_GEN',
  IMAGE_EDIT = 'IMAGE_EDIT',
  ANALYZE = 'ANALYZE'
}

export interface NodeData {
  label: string;
  type: NodeType;
  output?: string; // URL or Base64
  input?: any;
  params?: any;
  loading?: boolean;
}

export interface Point {
  x: number;
  y: number;
}
