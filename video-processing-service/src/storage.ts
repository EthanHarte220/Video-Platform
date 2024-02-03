/*
Google Cloud Storage file interactions
Additionally local file interactions
*/
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "EHVS-storage-raw-videos"; 
const processedVideoBucketName = "EHVS-storage-processed-videos"; 

const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = "./processed-videos";

//create local directories for raw and unprocessed videos
export function setupDirectories() {
    ensureDirectoryPath(localRawVideoPath);
    ensureDirectoryPath(localProcessedVideoPath);
}

/**
 * @param rawVideoName -File uploaded by user {@link localRawVideoPath}
 * @param processedVideoName - Name of the user's file is converted to{@link localProcessedVideoPath}
 * @returns - Promise is resolved when video is converted
*/
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions('-vf', 'scale=-1:360')
        //.outputOptions('-af', 'volume=15.0')
        .on('end', () => {
            console.log("Processing finished successfully.");
            resolve();
        })
        .on('error', (err) => {
            console.log(`An error has occured: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    })
    
}

/**
 * @param fileName - Name of the file to download from
 * {@link rawVideoBucketName} bucket into {@link localRawVideoPath}
 * @returns Promise is resolved when file is downloaded
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
      .file(fileName)
      .download({ destination: `${localRawVideoPath}/${fileName}` });

    console.log(
      `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    ) 
}

/**
 * @param fileName - Name of file to upload from
 * {@link localProcessedVideoPath} folder to {@link processedVideoBucketName}
 * @returns Promise is resolved once uploading is complete
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
      destination: fileName
    });
    console.log(
      `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
    );

    await bucket.file(fileName).makePublic(); //make public so all users can see the processed video
}

/**
 * @param fileName - Raw video to be deleted
 * {@link localRawVideoPath} - folder path
 * @returns Promise fulfilled once the file has been deleted
 */
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - Processed video to be deleted
 * {@link localProcessedVideoPath} - folder path
 * @returns Promise fulfilled once file is deleted
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - Path of the file to be deleted
 * @returns Promise is resolved once file is deleted
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if(fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if(err) {
                console.log(`Failed to delate file at ${filePath}`, err);
                reject(err);
            } else {
                console.log(`File deleted at ${filePath}`);
                resolve();
            }
        })
      } else {
            console.log(`File not found at ${filePath}, skipping deletion`);
            reject();
      }
    });
}

/**
 * Ensure a directory exists, if not present than create the directory
 * @param {string} dirPath - Dir path to check
 */
function ensureDirectoryPath(dirPath: string) {
    if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created at ${dirPath}`);
    }
}