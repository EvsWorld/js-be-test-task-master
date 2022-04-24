import { MediaContext, MediaComplete } from "../types";
import { getMedia } from "../services/media.services";

const isContextRelevant = (context) => ["back", "front"].includes(context);

const sortHighToLow = (a, b) => {
  return b.probability - a.probability;
};

const findCurrentMedia = (mData, current) =>
  mData.find((m) => {
    return m.id === current.mediaId;
  });

export const handleMedia = async (req, res, next) => {
  const { sessionId } = req.params;
  try {
    // call the other end points to collect and filter the required data
    const { mediaData, mediaContextData } = await getMedia(sessionId);

    // combine media and mediaContext to group by front and back, and sorting by
    // probility TODO: refactor to services folder? Make this function
    // imperitive. Named like: correctAndAddMedia(mediaData, mediaContext)
    const correctAndAddMedia = (mediaData, mediaContext) => {
      const r = mediaContext.reduce(
        (acc: MediaComplete, cur: MediaContext) => {
          // TODO: move to utils folder
          const mediaCurrent = findCurrentMedia(mediaData, cur);
          // exclude the media where context is not front or back
          if (isContextRelevant(cur.context)) {
            // correct the contexts and include all data together
            acc.context[cur.context].push({
              // TODO: correct types
              id: cur!.mediaId,
              contextId: cur.id,
              mimeType: mediaCurrent.mimeType,
              context:
                cur.context === "front" ? "document-front" : "document-back",
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
    return res
      .status(200)
      .json(correctAndAddMedia(mediaData, mediaContextData));
  } catch (error: any) {
    next(error);
  }
};
