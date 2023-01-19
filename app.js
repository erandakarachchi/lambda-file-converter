"use strict";
const {
  convertTo,
  canBeConvertedToPDF,
} = require("@shelf/aws-lambda-libreoffice");

const AWS = require("aws-sdk");
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

module.exports.convertFile = async (event) => {
  try {
    console.log("EVENT : ", JSON.stringify(event));
    console.log("FUNCTIONS convertTo: ", convertTo);
    console.log("FUNCTIONS canBeConvertedToPDF: ", canBeConvertedToPDF);
    const { name } = event.Records[0].s3.bucket;
    const { key } = event.Records[0].s3.object;
    const s3Params = {
      Bucket: name,
      Key: key,
    };
    const file = await s3.getObject(s3Params).promise();
    console.log("FILE RETRIEVED : ", file);
    console.log("FILE TYPE : ", typeof file);
    const result = canBeConvertedToPDF(file);
    console.log("RESULT : ", result);
  } catch (error) {
    console.log("ERROR OCCURRED : ", error);
  }
};
