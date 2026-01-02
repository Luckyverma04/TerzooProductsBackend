import multer from "multer";
import path from "path";

// ================= STORAGE =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // already existing
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {
  // Allow product images
  if (file.fieldname === "productImage") {
    if (
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  }

  // Allow CSV for lead upload
  else if (file.fieldname === "file") {
    if (
      file.mimetype === "text/csv" ||
      file.originalname.endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files allowed"), false);
    }
  }

  // Reject everything else
  else {
    cb(new Error("Invalid file field"), false);
  }
};

// ================= MULTER INSTANCE =================
export const upload = multer({
  storage,
  fileFilter,
});

// ================= EXISTING EXPORT (UNCHANGED) =================
export const uploadProductImage = upload.single("productImage");

// ================= NEW EXPORT FOR CSV =================
export const uploadCSV = upload.single("file");
