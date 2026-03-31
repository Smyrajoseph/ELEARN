// // middleware/uploadMiddleware.js
// import multer from "multer";
// import path from "path";

// // Storage config (local uploads folder)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/videos"); // folder path
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // unique filename
//   },
// });

// // File filter (only video types)
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["video/mp4", "video/mkv", "video/avi"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only videos allowed."), false);
//   }
// };

// export const uploadVideo = multer({ storage, fileFilter });