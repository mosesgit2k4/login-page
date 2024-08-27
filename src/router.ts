import {Router} from "express"

import { userManagementRouter } from "./controller/router";
export const router:Router = Router()
router.use('/user-management',userManagementRouter)




    