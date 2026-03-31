import mongoose from "mongoose";

function getDb() {
  if (!mongoose.connection.db) {
    throw new Error("Mongo connection not initialized yet");
  }
  return mongoose.connection.db;
}

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("Mongo connection not initialized yet");
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "attachments"
  });
}

export { getDb, getBucket };