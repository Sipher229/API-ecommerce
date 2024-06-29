import express from "express";
import db from "../dbConnection.js";
import bcrypt from 'bcrypt'
import createError from "http-errors";
import { signAccessToken } from "../jwtLogic.js";


const router = express.Router()
const saltRounds = 10

router.post('/register', async (req, res, next) => {
    const {email, password, fname, lname, gender, age} = req.body
    const qry = 'INSERT INTO customers(email, password, fname, lname, gender, age) VALUES($1, $2, $3, $4, $5, $6)'
    const checkExistQry = 'SELECT email FROM customers WHERE email = $1'

    try{
        const result = await (await db.query(checkExistQry, [email])).rows
        if(result.length !== 0){
            return next(createError.Conflict('Email already exists'))
        }
    }catch(error){
        return next(createError.InternalServerError(error.message))
    }
    
    bcrypt.hash(password, saltRounds,  (error, hash) =>{
        if (error) return next(error)
        db.query(qry, [email.toLowerCase(), hash, fname, lname, gender.toLowerCase(), age], async (err, result) =>{
            if (err) return next(createError.InternalServerError(err))

            try{
                const token = await signAccessToken({email})
                return res.json({
                    message: "registered succcessfully",
                    token: token,
                })
            }catch(error){
                next(createError.InternalServerError(error))
            }
            

        })
    } )

})


router.post('/login', async (req, res, next) => {
    const {email, password} = req.body
    const qry = 'SELECT email, password FROM customers WHERE email = $1'
    try{
        const result = (await db.query(qry, [email.toLowerCase()])).rows
        if(result.length === 0){
            return next(createError.BadRequest('Not registered yet'))
        }
        const hash = result[0].password
        bcrypt.compare(password, hash, async (err, result) => {
            if (err) return next(createError.BadRequest('password is required'))
            
            if (result){
                const token = await signAccessToken({email})

                return res.json({
                    message: "logged in successfully",
                    token: token
                })
            }
            else{
                return next(createError.Conflict('Wrong password!'))
            }
    
        })

    } catch(error){
        return next(createError.InternalServerError("server error: " + error.message))
    }


})


export default router






