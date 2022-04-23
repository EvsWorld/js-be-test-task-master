import { MediaContext, MediaComplete } from "../types";
import { getMedia } from "../services/media.services";

export const handleMedia = async (req, res, next) => {
  const { sessionId } = req.params;
  try {
    // call the other end points to collect and filter the required data
    const { mediaData, mediaContextData } = await getMedia(sessionId);

    // combine media and mediaContext to group by front and back, and sorting by
    // probility TODO: refactor to services folder? Make this function
    // imperitive. Named like: correctAndAddMedia(mediaData, mediaContext)
    const r = mediaContextData.reduce(
      (acc: MediaComplete, cur: MediaContext) => {
        // TODO: move to utils folder
        const sortHighToLow = (a, b) => {
          return b.probability - a.probability;
        };
        // TODO: refactor to function
        const mediaCurrent = mediaData.find((m) => {
          return m.id === cur.mediaId;
        });
        // exclude the media where context is not front or back
        // TODO: refactor to function
        if (["back", "front"].includes(cur.context)) {
          // correct the contexts and include all data together
          if (cur.context === "front") {
            acc.context.front.push({
              // TODO: correct types
              id: cur!.mediaId,
              contextId: cur.id,
              mimeType: mediaCurrent!.mimeType,
              context: "document-front",
              probability: cur.probability,
            });
          }
          if (cur.context === "back") {
            acc.context.back.push({
              id: cur!.mediaId,
              contextId: cur.id,
              mimeType: mediaCurrent!.mimeType,
              context: "document-back",
              probability: cur.probability,
            });
          }
        }
        acc.context.front.sort(sortHighToLow);
        acc.context.back.sort(sortHighToLow);

        return acc;
      },
      { context: { back: [], front: [] } }
    );
    console.log("r :>> ", JSON.stringify(r, null, 2));
    return res.status(200).json(r);
  } catch (error: any) {
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
    next(error);
    //   return res
    //     .status(error.response.status)
    //     .json({ message: error.response.data });
  }
};
