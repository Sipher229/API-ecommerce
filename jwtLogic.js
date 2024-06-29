import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import 'dotenv/config'


const signAccessToken = (user) => {
    return new Promise((resolve, reject) => {
        const payload = user
        const secret = process.env.TOKEN_KEY
        const options = {
            audience: user.email,
            issuer: 'eyewear@ricardo.com',
            expiresIn: '1h'
        }
        jwt.sign(payload, secret, options, (error, token) =>{
            if (error) return reject(error)
            
            resolve(token)
        })
    })
}

const verifyAccessToken = (req, res, next) => {
    
    if(!req.headers['authorization']) return next(createError.Unauthorized())
    
    const receivedToken = req.headers['authorization'].split(' ')[1]
    jwt.verify(receivedToken, process.env.TOKEN_KEY, (err, payload) => {
        if(err){
            // if (err.name !== "JsonWebTokenError"){ 
            
            //     next(createError.Unauthorized(err.message))
            // }
            // else{
            //     next(createError.Unauthorized())
            // }
            const message = err.name === "JsonWebTokenError" ? 'Unauthorized' : err.message
            next(createError.Unauthorized(message))
        }
        
        req.payload = payload
        next()
    })
}

export {signAccessToken, verifyAccessToken}