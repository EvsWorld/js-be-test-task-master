import { Media, MediaContext, MediaComplete } from "../types";
import { getMedia } from "../services/media.services";

export const handleMedia = async (req, res) => {
  // console.log("req :>> ", req);
  const { sessionId } = req.params;
  console.log("sessionId :>> ", sessionId);
  try {
    // call the other end points to collect and filter the required data
    const { mediaData, mediaContextData } = await getMedia(sessionId);

    console.log("mediaData :>> ", mediaData);
    console.log("mediaContextData :>> ", mediaContextData);
    // combine media and mediaContext to group by front and back, and sorting by
    // probility
    // TODO: put reduce function in a controller
    const r = mediaContextData.reduce(
      (acc: MediaComplete, cur: MediaContext) => {
        const sortHighToLow = (a, b) => {
          return b.probability - a.probability;
        };
        console.log("acc before  :>> ", acc);
        console.log("cur :>> ", cur);
        // TODO: assign probability
        const mediaCurrent = mediaData.find((m) => {
          return m.id === cur.mediaId;
        });
        // exclude the media where context is not front or back
        if (["back", "front"].includes(cur.context)) {
          // correct the contexts and include all data together
          if (cur.context === "front") {
            acc.context.front.push({
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

        console.log("acc after:>> ", acc);

        return acc;
      },
      { context: { back: [], front: [] } }
    );

    return res.status(200).json(r);
  } catch (error: any) {
    console.error("Error happened", error);
    return res
      .status(error.response.status)
      .json({ message: error.response.data });
  }
};
