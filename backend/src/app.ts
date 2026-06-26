import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import 'dotenv/config'
import { initSocket } from './socket.js'
import { createServer } from 'http'

import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import session from 'express-session'

import authRouter from '../routes/authRouter.js'
import profileRouter from '../routes/profileRouter.js'
import postRouter from '../routes/postsRouter.js'
import chatRouter from '../routes/chatRouter.js'

config()

const port = process.env.PORT || 3000;
const session_secret = process.env.SESSION_SECRET

if(!session_secret) throw new Error('Отсутствует SESSION_SECRET в .env!')

const app = express()

const limiter = rateLimit({
    windowMs: 1000,
    max: 50,
    message: 'Too much requests',
    standardHeaders: true,
    legacyHeaders: false
})


declare module "express-session" {
    interface SessionData{
        userId?: number,
        auth?: boolean,
        email?: string,
        username?: string
    }
}

app.use(limiter)
app.use(helmet({
    crossOriginResourcePolicy: false
}))
app.use(cors({
    origin:['http://localhost:5173', 'http://localhost'],
    credentials: true
}))

const sessionMiddleware = session({
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 14,
        secure: false,
        httpOnly: true
    }
})

app.use(sessionMiddleware)

app.use(express.json())

app.use("/ping", (req, res) => {
    res.json({message: "ping"})
})

app.use('/uploads', express.static('uploads'))
app.use(authRouter)
app.use(profileRouter)
app.use(postRouter)
app.use('/chat', chatRouter)


const httpServer = createServer(app)
initSocket(httpServer, sessionMiddleware)

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


