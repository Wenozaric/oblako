import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateData = (schema: z.ZodTypeAny) => 
    async( req: Request, res: Response, next: NextFunction) => {
        try{
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            })

            return next()
        } catch ( e ){
            console.log(e)
            return res.status(400).json({ message: e })
        }
    }