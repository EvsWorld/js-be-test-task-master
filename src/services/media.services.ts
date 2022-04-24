import axios, { AxiosError } from "axios";
import { Media, MediaContext, MediaComplete } from "../types";
import { sortHighToLow, waitFor } from "../utils";

// TODO: move this to utils folder
async function retryPromiseWithDelay(
  promise,
  which: string,
  nthTry = 4,
  delayTime = 1000
) {
  try {
    const res = await promise;
    // console.log("res :>> ", res);

    return res;
  } catch (error: any) {
    if (nthTry === 1) {
      return Promise.reject(error);
    }
    console.log("retrying", which, nthTry, "time");
    console.log("error.response.data :>> ", error.response.data);
    await waitFor(delayTime);
    return retryPromiseWithDelay(promise, which, nthTry - 1, delayTime);
  }
}

// call media and get {id, memeType, context,..}
// TODO:
export const getMedia = async (sessionId: string) => {
  const mediaPromiseCall = axios.get<Media[]>(
    `https://api.company.internal/sessions/${sessionId}/media`
  );
  const mediaPromise = retryPromiseWithDelay(mediaPromiseCall, "media");

  const mediaContextPromiseCall = axios.get<MediaContext[]>(
    `https://api.company.internal/media-context/${sessionId}`
  );
  const mediaContextPromise = retryPromiseWithDelay(
    mediaContextPromiseCall,
    "context"
  );

  const [media, mediaContext]: [{ data: Media[] }, { data: MediaContext[] }] =
    await Promise.all([mediaPromise, mediaContextPromise]);
  console.log("media :>> ", media.data);
  console.log("mediaContext :>> ", mediaContext.data);
  return { mediaData: media?.data, mediaContextData: mediaContext?.data };
};

const isContextRelevant = (context) => ["back", "front"].includes(context);

const findCurrentMedia = (mData, current) =>
  mData.find((m) => {
    return m.id === current.mediaId;
  });

// combine media and mediaContext to group by front and back, and sorting by
// probility
export const correctAndAddMedia = (mediaData, mediaContext) => {
  const r = mediaContext.reduce(
    (acc: MediaComplete, cur: MediaContext) => {
      const mediaCurrent = findCurrentMedia(mediaData, cur);
      // exclude the media where context is not front or back
      if (isContextRelevant(cur.context)) {
        // correct the contexts and include all data together
        acc.context[cur.context].push({
          id: cur!.mediaId,
          contextId: cur.id,
          mimeType: mediaCurrent.mimeType,
          context: cur.context === "front" ? "document-front" : "document-back",
          probability: cur.probability,
        });
      }
      acc.context.front.sort(sortHighToLow);
      acc.context.back.sort(sortHighToLow);

      return acc;
    },
    { context: { back: [], front: [] } }
  );
  console.log("r :>> ", JSON.stringify(r, null, 2));
  return r;
};
