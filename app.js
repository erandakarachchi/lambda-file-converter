"use strict";
const { convertTo, canBeConvertedToPDF } = require("@shelf/aws-lambda-libreoffice");
const fs = require("fs").promises;
const AWS = require("aws-sdk");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

module.exports.convertFile = async (event) => {
  try {
    const CONVERTED_FILE_UPLOAD_BUCKET = process.env.CONVERTED_FILE_UPLOAD_BUCKET;
    const { name } = event.Records[0].s3.bucket;
    const { key: fileName } = event.Records[0].s3.object;
    const consumerS3Params = {
      Bucket: name,
      Key: fileName,
    };
    const fileFromS3 = await s3.getObject(consumerS3Params).promise();
    const filePath = `/tmp/${fileName}`;
    await fs.writeFile(filePath, fileFromS3.Body);
    if (!canBeConvertedToPDF(fileName)) {
      const fileNotSupportedError = new Error();
      fileNotSupportedError.name = "File Not Supported";
      fileNotSupportedError.message = "Uploaded File Not Supported";
      throw fileNotSupportedError;
    }
    const convertedFilePath = convertTo(fileName, "pdf");
    const fileData = await fs.readFile(convertedFilePath);
    const base64Data = Buffer.from(fileData, "binary");
    const [newFileName] = convertedFilePath.split("/").slice(-1);
    const uploadS3Params = {
      Body: base64Data,
      Bucket: CONVERTED_FILE_UPLOAD_BUCKET,
      Key: newFileName,
    };
    await s3.putObject(uploadS3Params).promise();
  } catch (error) {
    console.log("ERROR : ", error);
  }
};
