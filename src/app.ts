import './register-paths';
import mongoose from 'mongoose';
import express from 'express';
import "dotenv/config";
import {errorHandler} from './routes/error';
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cors from 'cors';
import authRouter from "./routes/auth";
import apiRouter from './routes/api';
import {assertEnvVariables} from 'util/assertEnvVariables';
import {loadUser} from 'middlewares/loadUser';
import multer from 'multer';
import {Client as MinioClient} from "minio";
import * as process from "node:process";
import cookieParser from "cookie-parser";

const app = express();

const PORT = process.env.PORT;
const minioClient = new MinioClient({
    endPoint: process.env.STORAGE_URL || 'storage.googleapis.com',
    port: parseInt(process.env.STORAGE_PORT || "443"),
    useSSL: process.env.STORAGE_SSL === 'true',
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
})

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const envVariable = assertEnvVariables([
    'BARE_MONGO_URL',
    'MONGO_USER',
    'MONGO_PASS',
    'DATABASE_NAME',
    'STORAGE_URL',
    'STORAGE_PORT',
    'STORAGE_SSL',
    'STORAGE_ACCESS_KEY',
    'STORAGE_SECRET_KEY',
    'NODE_ENV'
])

console.log(JSON.stringify(envVariable))

mongoose.connect(envVariable["BARE_MONGO_URL"], {
    user: envVariable["MONGO_USER"],
    pass: envVariable["MONGO_PASS"],
    dbName: envVariable["DATABASE_NAME"],
}).then(async () => {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
        }),
        cookie: {
            secure: envVariable["NODE_ENV"] == "prod",
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        }
    }));

    console.log('Connected to MongoDB');


    let regex = /^https:\/\/roll-to-match-frontend[-\w]*-pippocimuts-projects\.vercel\.app$/;
    if (envVariable["NODE_ENV"] == "dev") regex = /^http:\/\/localhost:\d+$/;
    
    const allowedOrigins = [
        "https://accounts.google.com" // Google's origin
    ];

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || regex.test(origin) || allowedOrigins.includes(origin)) {
                callback(null, true); // Allow this origin
            } else {
                callback(new Error('Not allowed by CORS')); // Reject this origin
            }
        },
        credentials: true // Allow cookies/tokens
    }));


    app.use(cookieParser());
    app.use(loadUser)
    app.use('/auth', express.json(), authRouter);
    const upload = multer({
        dest: '/tmp/', // Temporary storage location
        limits: {
            fileSize: 10 * 1024 * 1024, // Set limit to 10MB (10 * 1024 * 1024 bytes)
        },
    });

    app.use("/upload-image", upload.single("file"), async (req, res, next) => {
        const image = req.file;
        if (!image) {
            res.status(400).send('No image provided');
            return
        }

        const bucketExists = await minioClient.bucketExists('image-bucket-bbk-project');

        if (!bucketExists){
            await minioClient.makeBucket('image-bucket-bbk-project', 'eu-north-1')
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: "*",
                        Action: ["s3:GetObject"],
                        Resource: ["arn:aws:s3:::image-bucket-bbk-project/*"]
                    }
                ]
            };

            await minioClient.setBucketPolicy('image-bucket-bbk-project', JSON.stringify(policy));
        }

        const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const fileExtension = image.originalname.split('.').pop();

        const newFileName = `${randomName}.${fileExtension}`;

        await minioClient.fPutObject('image-bucket-bbk-project', newFileName, image.path);
        const hostURl = process.env.STORAGE_URL || 'storage.googleapis.com';
        const port = process.env.STORAGE_PORT || '443';
        const protocol = process.env.STORAGE_SSL === 'true' ? 'https' : 'http';
        const imageUrl = `${protocol}://${hostURl}:${port}/image-bucket-bbk-project/${newFileName}`
        console.log(imageUrl)
        res.status(200).json(imageUrl)
    });

    if (await minioClient.bucketExists('image-bucket-bbk-project')) {
        console.log('Storage Bucket exists');
    }

    //app.use(express.urlencoded({extended: false}));
    app.use('/api', express.json(), apiRouter)
    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});