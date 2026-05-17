const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

function uploadToS3(req, res, next) {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const bucketName = "ncf-store";
  
  
  const uniqueSuffix = `${uuidv4()}-${Date.now()}`;
  const fileName = `${uniqueSuffix}-${req.file.originalname}`;
  
  const fileBuffer = req.file.buffer;

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading file to S3:", err.message);
      return res.status(500).send("File upload to S3 failed.");
    }

    console.log("File uploaded successfully to S3:", data.Location);

    req.s3UploadResult = data;

    next();
  });
}

module.exports = uploadToS3;