import express from "express";
import { Router } from "express";
import usersSessionHandler from "../authHandler/middlewareAuth";
import { addressControllers, userControllers } from "./user-managementcontroller/controller";
export const userManagementRouter:Router = Router()
//bulk users with address
userManagementRouter.post('/bulk/',userControllers.createBulkuser)
//user login
userManagementRouter.post("/login/",userControllers.loginUser);
//Register or create a new user with address
userManagementRouter.post("/",userControllers.createUser);
// get all the users
userManagementRouter.get("/",usersSessionHandler,userControllers.getUsers);

//get user by id with address
userManagementRouter.get("/:id",userControllers.getUser);

// update user by id
userManagementRouter.put("/:id",userControllers.updateUser);

// delete users
userManagementRouter.delete("/:id",userControllers.deleteUser);

userManagementRouter.get('/address/:id',addressControllers.getAddress);
userManagementRouter.post('/bulkaddress/',addressControllers.createBulkAddress);

//forget password and reset
userManagementRouter.post("/forgetpassword/",userControllers.forgetUser);

//reset password
userManagementRouter.put("/user/resetpassword/",userControllers.updatepassword);