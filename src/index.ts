import express from "express";
import "./externalService";
import { sessions } from "./routes/media.routes";

const app = express();
const port = 3000;

app.use("/api/sessions", sessions);
app.listen(port, () => {
  console.info(`Service is listening at http://localhost:${port}`);
});
