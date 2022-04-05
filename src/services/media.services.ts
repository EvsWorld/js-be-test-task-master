import axios from "axios";
import { Media, MediaContext } from "../types";

function waitFor(millSeconds) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, millSeconds);
  });
}
async function retryPromiseWithDelay(
  promise,
  which: string,
  nthTry = 4,
  delayTime = 2000
) {
  try {
    const res = await promise;
    return res;
  } catch (e) {
    if (nthTry === 1) {
      return Promise.reject(e);
    }
    console.log("retrying", which, nthTry, "time");
    await waitFor(delayTime);
    return retryPromiseWithDelay(promise, which, nthTry - 1, delayTime);
  }
}

// call media and get {id, memeType, context,..}
export const getMedia = async (sessionId: string) => {
  const mediaPromiseCall = axios.get<Media[]>(
    `https://api.company .internal/sessions/${sessionId}/media`
  );
  const mediaPromise = retryPromiseWithDelay(mediaPromiseCall, "media");

  const mediaContextPromiseCall = axios.get<MediaContext[]>(
    `https://api.company .internal/media-context/${sessionId}`
  );
  const mediaContextPromise = retryPromiseWithDelay(
    mediaContextPromiseCall,
    "context"
  );

  const [media, mediaContext]: [{ data: Media[] }, { data: MediaContext[] }] =
    await Promise.all([mediaPromise, mediaContextPromise]);
  return { mediaData: media.data, mediaContextData: mediaContext.data };
};
