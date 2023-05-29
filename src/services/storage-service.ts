import AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

const uploadImage = async (file: Buffer, fileName: string): Promise<string> => {
    // Set up the params for AWS S3
    const params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: fileName,
        Body: file,
        ContentType: fileName.split('.')[1],
    };
    // Upload the image to AWS S3
    const data: ManagedUpload.SendData = await s3.upload(params).promise();
    return data.Location;
};

export default uploadImage;