import { correctAndAddMedia, getMedia } from "../services/media.services";

export const handleMedia = async (req, res, next) => {
  const { sessionId } = req.params;
  try {
    const { mediaData, mediaContextData } = await getMedia(sessionId);

    return res
      .status(200)
      .json(correctAndAddMedia(mediaData, mediaContextData));
  } catch (error: any) {
    next(error);
  }
};
