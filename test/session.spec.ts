import axios from "axios";
const desired = {
  context: {
    back: [
      {
        id: "a6c90b4f-ddfc-49eb-89ad-05b7f1274f96",
        contextId: "a4338068-d99b-416b-9b2d-ee8eae906eea",
        mimeType: "image/png",
        context: "document-back",
        probability: 0.9739324,
      },
    ],
    front: [
      {
        id: "40851916-3e86-45cd-b8ce-0e948a8a7751",
        contextId: "2ab2e6fe-6727-4a04-bbdf-9f012569bce9",
        mimeType: "image/png",
        context: "document-front",
        probability: 0.9264236,
      },
      {
        id: "7f2dcbd8-5b5f-4f1a-bfa4-016ddf4dd662",
        contextId: "5da01045-6baf-482c-9913-5ce069bbec96",
        mimeType: "image/png",
        context: "document-front",
        probability: 0.8734357,
      },
      {
        id: "40f1e462-6db8-4313-ace3-83e4f5619c56",
        contextId: "93d1a76b-b133-41cc-ae85-aa8b80d93f57",
        mimeType: "image/png",
        context: "document-front",
        probability: 0.2931033,
      },
    ],
  },
};
jest.setTimeout(8000);

// TEST GOALS:

// Query for the media that applies to that sessionId Filter out the
// irrelevant media (where media-context was ‘none’). media of
// id: 663ae1db-32b6-4a4e-a828-98e3e94ca11e should be excluded for this reason.

// Correct discrepancies with regard to the context (using the context given by
// the /media-context service as truth). media of id:
// 40f1e462-6db8-4313-ace3-83e4f5619c56 should be corrected from ‘document-back’ to
// ‘document-front’ for this reason.

// And finally, combine all the data from all the apis and group them by context
// and sort them by probability.
describe("GET http://localhost:3000/api/sessions/:sessionId", () => {
  it("should return session with media", async () => {
    const response = await axios.get(
      "http://localhost:3000/api/sessions/90d61876-b99a-443e-994c-ba882c8558b6"
    );
    // console.log("response = ", response);
    expect(response.status).toEqual(200);
    expect(response.data).toMatchObject(desired);
  });
});
