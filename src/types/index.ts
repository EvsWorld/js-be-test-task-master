export interface Media {
  id: string;
  mimeType: string;
  context: string;
}
export interface MediaContext {
  id: string;
  mediaId: string;
  context: string;
  probability: number;
}
export interface MediaData {
  id: string;
  contextId: string;
  context: string;
  mimeType: string;
  probability: number;
}
export interface MediaComplete {
  context: {
    back: MediaData[];
    front: MediaData[];
  };
}
