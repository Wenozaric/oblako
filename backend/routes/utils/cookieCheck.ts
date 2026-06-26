import { Request, Response, NextFunction } from "express"

export const cookieCheck = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.session)
    if (req.session.auth == true) return res.status(401).json({ message: "Уже авторизированны" });
    next()
}