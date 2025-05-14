import { createSecureMessage } from "../../../../utils/crypto";

export const postMessage = async (text: string, privateKey: string) => {
  const timestamp = new Date().toISOString();
  const message = await createSecureMessage(
    "event.post",
    timestamp,
    { content: text },
    privateKey
  );
};

export const getPosts = async () => {};
