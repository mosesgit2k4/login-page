import {Request,Response,NextFunction} from "express"
import {verify} from "jsonwebtoken"
import { secret_token } from "../config/dotenv";


function usersSessionHandler(req:Request,res:Response, next:NextFunction){
    const authHeader = req.headers["authorization"]
            let jwtToken;
            if(authHeader!=undefined){
                jwtToken = authHeader.split(" ")[1]
            }
            if(jwtToken===undefined){
                res.status(401);
                res.send("Invalid JWT Token")
            }
            else{
                verify(jwtToken,secret_token,async (error,payload)=>{
                    if(error){
                        res.status(401);
                        res.send("Invalid JWT Token")
                    }
                    else{
                        next()
                    }
                })
            }
}



export default usersSessionHandler