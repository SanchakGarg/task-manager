import { google } from "googleapis";
import { prisma } from "./db";

export async function getGoogleClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) {
    throw new Error("No Google account linked or missing access token");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await prisma.account.updateMany({
        where: { userId, provider: "google" },
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : undefined,
        },
      });
    }
  });

  return oauth2Client;
}

export async function createGoogleDoc(userId: string, title: string) {
  const auth = await getGoogleClient(userId);
  const docs = google.docs({ version: "v1", auth });
  const drive = google.drive({ version: "v3", auth });

  const doc = await docs.documents.create({
    requestBody: { title },
  });

  const docId = doc.data.documentId!;
  const docUrl = `https://docs.google.com/document/d/${docId}/edit`;

  await drive.permissions.create({
    fileId: docId,
    requestBody: { role: "writer", type: "anyone" },
  });

  return { id: docId, url: docUrl, title };
}

export async function createGoogleSheet(userId: string, title: string) {
  const auth = await getGoogleClient(userId);
  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  const sheet = await sheets.spreadsheets.create({
    requestBody: { properties: { title } },
  });

  const sheetId = sheet.data.spreadsheetId!;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

  await drive.permissions.create({
    fileId: sheetId,
    requestBody: { role: "writer", type: "anyone" },
  });

  return { id: sheetId, url: sheetUrl, title };
}

export async function uploadFileToDrive(
  userId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
) {
  const auth = await getGoogleClient(userId);
  const drive = google.drive({ version: "v3", auth });

  const { Readable } = await import("stream");
  const stream = Readable.from(buffer);

  const file = await drive.files.create({
    requestBody: { name: fileName, mimeType },
    media: { mimeType, body: stream },
    fields: "id, name, mimeType, size, webViewLink, thumbnailLink",
  });

  return {
    id: file.data.id!,
    name: file.data.name!,
    mimeType: file.data.mimeType!,
    size: parseInt(file.data.size ?? "0"),
    url: file.data.webViewLink!,
    thumbnailUrl: file.data.thumbnailLink ?? null,
  };
}

export async function getGoogleDocTitle(userId: string, docId: string) {
  try {
    const auth = await getGoogleClient(userId);
    const docs = google.docs({ version: "v1", auth });
    const doc = await docs.documents.get({ documentId: docId });
    return doc.data.title ?? "Untitled Document";
  } catch {
    return "Untitled Document";
  }
}

export async function getGoogleSheetTitle(userId: string, sheetId: string) {
  try {
    const auth = await getGoogleClient(userId);
    const sheets = google.sheets({ version: "v4", auth });
    const sheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    return sheet.data.properties?.title ?? "Untitled Sheet";
  } catch {
    return "Untitled Sheet";
  }
}
