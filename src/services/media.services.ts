import axios from "axios";
import { Media, MediaContext, MediaComplete, MediaData } from "../types";

// call media and get {id, memeType, context}
// TODO: make these call concurently
// TODO: implement retry
export const getMedia = async (sessionId: string) => {
  const mediaPromise = axios.get<Media[]>(
    `https://api.company .internal/sessions/${sessionId}/media`
  );
  const mediaContextPromise = axios.get<MediaContext[]>(
    `https://api.company .internal/media-context/${sessionId}`
  );
  const [media, mediaContext]: [{ data: Media[] }, { data: MediaContext[] }] =
    await Promise.all([mediaPromise, mediaContextPromise]);
  console.log("media :>> ", media.data);
  console.log("mediaContext :>> ", mediaContext.data);
  return { mediaData: media.data, mediaContextData: mediaContext.data };
};
