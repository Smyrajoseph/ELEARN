import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// stream a stored file by its id (GridFS)
// stream a stored file by its id (GridFS) with Range support
router.get("/:id", async (req, res) => {
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "attachments",
    });

    const fileId = new mongoose.Types.ObjectId(req.params.id);

    // Get file metadata first
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = files[0];
    const range = req.headers.range;
    
    // Determine the Content-Type
    let contentType = file.contentType;
    if (!contentType) {
      const filename = file.filename.toLowerCase();
      if (filename.endsWith('.pdf')) contentType = 'application/pdf';
      else if (filename.endsWith('.txt')) contentType = 'text/plain';
      else if (filename.endsWith('.doc')) contentType = 'application/msword';
      else if (filename.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (filename.endsWith('.mp4')) contentType = 'video/mp4';
      else contentType = 'application/octet-stream';
    }

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      const chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${file.length}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
      });

      const downloadStream = bucket.openDownloadStream(fileId, { start, end: end + 1 });
      downloadStream.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": file.length,
        "Content-Type": contentType,
        "Content-Disposition": contentType.startsWith('image') || contentType === 'application/pdf' || contentType === 'text/plain' ? 'inline' : `attachment; filename="${file.filename}"`
      });
      bucket.openDownloadStream(fileId).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;