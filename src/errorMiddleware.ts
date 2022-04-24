import { NextFunction, ErrorRequestHandler, Request, Response } from "express";

export const errorMiddleware = async (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction /* do not remove next parameter, is required to have a json response */
) => {
  // logError(err);

  // 406 terms of use take url and add it to json
  // switch case to determine message to show to the user
  let { statusCode, message } = err;

  // console.log("err :>> ", err);
  if (!statusCode) {
    // console.log("statusCode :>> ", statusCode);
    statusCode = 500;
  }

  switch (statusCode) {
    case 500:
      message =
        "There has been an unexpected error, please contact us if the problem persists.";
      break;
    case 403:
      message = "You don't have required permissions.";
      break;
    case 401:
      message = "Your session has expired please log in again.";
      break;
  }
  res.status(statusCode).json({
    message,
  });
};
