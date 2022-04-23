import express, { ErrorRequestHandler } from "express";
import "./externalService";
import { sessions } from "./routes/media.routes";
import { errorMiddleware } from "./errorMiddleware";

const app = express();
const port = 3000;

app.use("/api/sessions", sessions);
app.use(<ErrorRequestHandler>errorMiddleware);

app.listen(port, () => {
  console.info(`Service is listening at http://localhost:${port}`);
});
