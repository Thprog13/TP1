import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./src/tp1web2-7a99d-firebase-adminsdk-fbsvc-bc02c67ed7.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function deleteAllUsers(nextPageToken) {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  const uids = result.users.map(user => user.uid);

  if (uids.length > 0) {
    await admin.auth().deleteUsers(uids);
    console.log(`✅ Supprimé ${uids.length} utilisateurs`);
  }

  if (result.pageToken) {
    await deleteAllUsers(result.pageToken);
  } else {
    console.log("🚮 Tous les utilisateurs ont été supprimés !");
  }
}

deleteAllUsers().catch(console.error);
