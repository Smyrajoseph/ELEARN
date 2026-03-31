import mongoose from "mongoose";

const sourceUri = "mongodb+srv://lmsUser:Ashrita%4007022006@lmscluster.urnkz3y.mongodb.net/test";
const targetUri = "mongodb+srv://lmsUser:Ashrita%4007022006@lmscluster.urnkz3y.mongodb.net/elearn";

const userSchema = new mongoose.Schema({}, { strict: false }); // flexible schema
const SourceUser = mongoose.createConnection(sourceUri).model("User", userSchema, "users");
const TargetUser = mongoose.createConnection(targetUri).model("User", userSchema, "users");

async function migrate() {
  try {
    const users = await SourceUser.find();
    console.log(`Found ${users.length} users in test DB`);

    if (users.length > 0) {
      await TargetUser.insertMany(users);
      console.log("✅ Migration complete: users copied to elearn DB");
    }
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    process.exit();
  }
}

migrate();