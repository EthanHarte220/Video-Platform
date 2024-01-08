import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
    //Get path of the input vvideo file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if(!inputFilePath || !outputFilePath) {
        let errMessage = "Bad Request: Missing : ";

        if(!inputFilePath) {
            errMessage += "inputFilePath ";
        }
        if(!outputFilePath) {
            errMessage += "outputFilePath";
        }
        res.status(400).send(errMessage.trim());
    }

    ffmpeg(inputFilePath)
      .outputOptions('-vf', 'scale=-1:360')
      .on('end', () => {
        res.status(200).send("Processing finished successfully.");
      })
      .on('error', (err) => {
        console.log(`An error has occured: ${err.message}`);
        res.status(500).send(`Internal Server Error: ${err.message}`);
      })
      .save(outputFilePath);

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Video processing service started at http://localhost:${port}`);
});
