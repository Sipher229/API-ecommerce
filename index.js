import express from "express"
import 'dotenv/config'
import bodyParser from "body-parser"
import cors from "cors"
import createError from 'http-errors'
import router from './routes/AuthRoutes.js'
import db from "./dbConnection.js"
import { verifyAccessToken } from "./jwtLogic.js"
import pdRouter from "./routes/productsRoutes.js"

const app = express()
const port = process.env.PORT



app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    optionSuccessStatus: '200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}))



app.use('/auth', router)
app.use('/products', pdRouter)

app.get("/customers/all", verifyAccessToken, async (req, res, next) => {
    const qry = "SELECT fname, lname, email FROM customers"
    db.query(qry, (err, response) => {
        if (err) {

            return next(createError.ExpectationFailed())
        }
        const data = response.rows
        res.status(200).json({
            data: data,
            message: "data retrived successfully",
            success: true   
        })
    })

})
app.use((req, res, next) => {
    next(createError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 404)
    res.json({
        error: {
            status: err.status || 404,
            message: err.message
        }
    })
})


app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})

