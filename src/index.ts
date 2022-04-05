import express from "express";
import cors from "cors";
import axios from "axios";
import "./externalService";

const app = express();
const port = 3000;
// media :>>  [
//   {
//     id: '7f2dcbd8-5b5f-4f1a-bfa4-016ddf4dd662',
//     mimeType: 'image/png',
//     context: 'document-front'
//   },
//   {
//     id: '663ae1db-32b6-4a4e-a828-98e3e94ca11e',
//     mimeType: 'image/png',
//     context: 'document-back'
//   },
//   {
//     id: '40f1e462-6db8-4313-ace3-83e4f5619c56',
//     mimeType: 'image/png',
//     context: 'document-back'
//   },
//   {
//     id: 'a6c90b4f-ddfc-49eb-89ad-05b7f1274f96',
//     mimeType: 'image/png',
//     context: 'document-front'
//   },
//   {
//     id: '40851916-3e86-45cd-b8ce-0e948a8a7751',
//     mimeType: 'image/png',
//     context: 'document-front'
//   }
// ]
// mediaContext :>>  [
//   {
//     id: 'a4338068-d99b-416b-9b2d-ee8eae906eea',
//     mediaId: 'a6c90b4f-ddfc-49eb-89ad-05b7f1274f96',
//     context: 'back',
//     probability: 0.9739324
//   },
//   {
//     id: '93d1a76b-b133-41cc-ae85-aa8b80d93f57',
//     mediaId: '40f1e462-6db8-4313-ace3-83e4f5619c56',
//     context: 'front',
//     probability: 0.2931033
//   },
//   {
//     id: '2277b909-f74e-4dc0-b152-328713948ec5',
//     mediaId: '663ae1db-32b6-4a4e-a828-98e3e94ca11e',
//     context: 'none',
//     probability: 0.9253487
//   },
//   {
//     id: '5da01045-6baf-482c-9913-5ce069bbec96',
//     mediaId: '7f2dcbd8-5b5f-4f1a-bfa4-016ddf4dd662',
//     context: 'front',
//     probability: 0.8734357
//   },
//   {
//     id: '2ab2e6fe-6727-4a04-bbdf-9f012569bce9',
//     mediaId: '40851916-3e86-45cd-b8ce-0e948a8a7751',
//     context: 'front',
//     probability: 0.9264236
//   }
// ]

//  desired:
//  {
//    context: {
//      back: [
//        {
//          id: 'a4338068-d99b-416b-9b2d-ee8eae906eea',
//          mediaId: 'a6c90b4f-ddfc-49eb-89ad-05b7f1274f96',
//          context: 'back',
//          probability: 0.9739324
//        },
//      ],
//      front: [
//       {
//         id: '2ab2e6fe-6727-4a04-bbdf-9f012569bce9',
//         mediaId: '40851916-3e86-45cd-b8ce-0e948a8a7751',
//         context: 'front',
//         probability: 0.9264236
//       },
//       {
//         id: '5da01045-6baf-482c-9913-5ce069bbec96',
//         mediaId: '7f2dcbd8-5b5f-4f1a-bfa4-016ddf4dd662',
//         context: 'front',
//         probability: 0.8734357
//       },
//      ]
//    }

//  }

// {
//   context: {
//     back: [
//       {
//         id
//         mediaId
//         mimeType
//         probability
//       }
//     ],
//     front: [
//       {
//         id
//         mediaId
//         mimeType
//         probability
//       }
//     ]
//   }
// }

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
  // [key: string]: string | number;
  contextId: string;
  // context?: string;
  mimeType: string;
  probability: number;
}
interface MediaComplete {
  context: {
    back: MediaData[];
    front: MediaData[];
  };
}

app.get("/api/sessions/:sessionId", async (req, res) => {
  // console.log("req :>> ", req);
  const { sessionId } = req.params;
  console.log("sessionId :>> ", sessionId);
  try {
    // call the other end points to collect and filter the required data
    // call media and get {id, memeType, context}
    // TODO: make these call concurently
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
    const r = media.data.reduce(
      (acc: MediaComplete, cur: Media) => {
        const sortHighToLow = (a, b) => {
          return b.probability - a.probability;
        };
        console.log("acc before  :>> ", acc);
        console.log("cur :>> ", cur);
        // TODO: assign probability
        const curContext = mediaContext.data.find((m) => {
          return m.mediaId === cur.id;
        });
        const probability = curContext!.probability;
        const contextId = curContext!.id;
        const context = curContext!.context;
        if (["back", "front"].includes(context)) {
          if (cur.context === "document-front") {
            acc.context.front.push({
              ...cur,
              contextId,
              probability,
            });
          }
          if (cur.context === "document-back") {
            acc.context.back.push({
              ...cur,
              contextId,
              probability,
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
});

app.listen(port, () => {
  console.info(`Service is listening at http://localhost:${port}`);
});
