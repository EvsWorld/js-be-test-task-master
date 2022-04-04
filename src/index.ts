import express from "express";
import cors from "cors";
import axios from "axios";
import "./externalService";

const app = express();
const port = 3000;

app.get("/api/sessions/:sessionId", async (req, res) => {
  // console.log("req :>> ", req);
  const { sessionId } = req.params;
  console.log("sessionId :>> ", sessionId);
  try {
    // call the other end points to collect and filter the required data
    // call media and get {id, memeType, context}
    const media = await axios.get(
      `https://api.company .internal/sessions/${sessionId}/media`
    );
    console.log("media :>> ", media.data);
    const mediaContext = await axios.get(
      `https://api.company .internal/media-context/${sessionId}`
    );
    console.log("mediaContext :>> ", mediaContext.data);
    return res.status(200).json({ hello: "its me" });
  } catch (error: any) {
    console.error("Error happened", error);
    return res
      .status(error.response.status)
      .json({ message: error.response.data });
  }
});

app.listen(port, () => {
  console.info(`Service is listening at http://localhost:${port}`);
});
