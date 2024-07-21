import express from 'express'
import multer from 'multer'
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import createError from 'http-errors'
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import db from '../dbConnection.js'



const pdRouter = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion

})

pdRouter.post('/addproducts', upload.single('image'), async (req, res, next) => {
    console.log('hello from addproducts')
    const {productName,
        quantity,
        size,
        gender,
        category,
        type,
        manufacturer,
        currency,
        color,
        price,} = req.body

    const imageName = req.file.originalname

    const qry = 'INSERT INTO products(name, quantity, category, gender, color, size, price, currencytype, type, manufacturer, imageurl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)'
    
    const imageParams = {
        Bucket: bucketName,
        Key: req.file.originalname,
        Body: req.file.buffer,
        contentType: req.file.mimetype
    }
    const putCommand = new PutObjectCommand(imageParams)

    // const getCommand = new GetObjectCommand( {
    //     Key: req.file.originalname,
    //     Bucket: bucketName,
    // })
    try{
        await s3.send(putCommand)
        // const url = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });
        db.query(qry, [productName, quantity, category, gender, color, size, price, currency, type, manufacturer, imageName], (err) =>{
            if (err) {
                return console.log(err.message)
            }
            })
        
        res.status(200).json({
            message: "successful",
        })

    }
    catch (error){
        console.log(error.message)
        return res.status(500).json({
            message: "something went terribly wrong"
        })
    }


})


export default pdRouter