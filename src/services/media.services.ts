import axios, { AxiosError } from "axios";
import { Media, MediaContext } from "../types";

// TODO: move this to utils folder
function waitFor(millSeconds) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, millSeconds);
  });
}

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
      // if (error.response) {
      //   // The request was made and the server responded with a status code
      //   // that falls out of the range of 2xx
      //   console.log("error.response.data: ", error.response.data);
      //   console.log("error.response.status: ", error.response.status);
      //   console.log("error.reqponse.headers: ", error.response.headers);
      // } else if (error.request) {
      //   // The request was made but no response was received
      //   // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      //   // http.ClientRequest in node.js
      //   console.log("error.request: ", error.request);
      // } else {
      //   // Something happened in setting up the request that triggered an Error
      //   console.log("error.message", error.message);
      // }
      // console.log("error.config: ", error.config);

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
    `https://api.veriff.internal/sessions/${sessionId}/media`
  );
  const mediaPromise = retryPromiseWithDelay(mediaPromiseCall, "media");

  const mediaContextPromiseCall = axios.get<MediaContext[]>(
    `https://api.veriff.internal/media-context/${sessionId}`
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
