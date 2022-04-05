import axios from "axios";

interface Media {
  id: string;
  mimeType: string;
  context: string;
}
interface MediaContext {
  id: string;
  mediaId: string;
  context: string;
  probability: number;
}
interface MediaData {
  id: string;
  contextId: string;
  context: string;
  mimeType: string;
  probability: number;
}
interface MediaComplete {
  context: {
    back: MediaData[];
    front: MediaData[];
  };
}

export const handleMedia = async (req, res) => {
  // console.log("req :>> ", req);
  const { sessionId } = req.params;
  console.log("sessionId :>> ", sessionId);
  try {
    // call the other end points to collect and filter the required data
    // call media and get {id, memeType, context}
    // TODO: make these call concurently
    // TODO: implement retry
    // TODO: put data calling in service
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
    // combine media and mediaContext to group by front and back, and sorting by
    // probility
    // TODO: put reduce function in a controller
    const r = mediaContext.data.reduce(
      (acc: MediaComplete, cur: MediaContext) => {
        const sortHighToLow = (a, b) => {
          return b.probability - a.probability;
        };
        console.log("acc before  :>> ", acc);
        console.log("cur :>> ", cur);
        // TODO: assign probability
        const mediaCurrent = media.data.find((m) => {
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
