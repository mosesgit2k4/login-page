import { Request, Response, NextFunction } from "express";
import { AddressServices, UserServices } from "../../service/service";
import { compare } from "bcrypt";
import { sign } from 'jsonwebtoken';
import { secret_token } from "../../config/dotenv";
import { userManagementRouter } from "../router";
import nodemailer from "nodemailer"
import sequelize from "sequelize";

let transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:'mosescstibu@gmail.com',
        pass :"fjpg tngo gbva ueix"
    }
})

let otp_store : string[] = []
let emailstore :string[] = []
interface RequestBody {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    mobilephone: number;
    gender: string;
    dob: string;
    addressId: number;
}
interface PostBody {
    firstName: string;
    lastName: string;
    password: string;
    username: string;
    gender: string;
    email: string;
    mobilephone: number;
    dob: string;
    address: AddressBody;

}
interface AddressBody {
    country: string;
    state: string;
    city: string;
    addresses: string;
    zipcode: number;
}

export class UserController {
    createBulkuser = async (req: Request, res: Response) => {
        try {
            const users: PostBody[] = req.body
            const usernames = new Set<string>();
            const emails = new Set<string>();
            const mobilephones = new Set<number>();
            const errors: string[] = []
            let data: object[] = []
            users.forEach(user => {
                const emaillower = user.email.toLowerCase()
                if (usernames.has(user.username)) {
                    errors.push(`Duplicate username is present ${user.username} for ${user.firstName} ${user.lastName}`)
                }
                else {
                    usernames.add(user.username)
                }
                if (emails.has(emaillower)) {
                    errors.push(`Duplicate email is present ${emaillower} for ${user.firstName} ${user.lastName}`)
                }
                else {
                    emails.add(emaillower)
                }
                if (mobilephones.has(user.mobilephone)) {
                    errors.push(`Duplicate phone number is present ${user.mobilephone} for ${user.firstName} ${user.lastName}`)
                }
                else{
                    mobilephones.add(user.mobilephone)
                }
            })
            if (errors.length > 0) {
                res.status(400).json({ errors, data });
                return
            }

            const creatingmap = await Promise.all(users.map(async (user: PostBody) => {
                const { firstName, lastName, email, mobilephone, gender, dob, address, username, password } = user
                const emaillower = email.toLowerCase()
                const emailval = await UserServices.getusersByemail(emaillower)
                const emailId = emaillower.endsWith(".com") || emaillower.endsWith(".gov") || emaillower.endsWith(".org") || emaillower.endsWith(".in")
                const usernameval = await UserServices.getUserByUsername(username)
                const message = {
                    from:"mosescstibu@gmail.com",
                    to:`${email}`,
                    subject:"Congrats on registering",
                    text:`Hello ${firstName} Welcome to our company.Kindly Login to explore more...`
                    }

                 
                if (usernameval) {
                    errors.push(`User with username ${username} already exist`)
                    return null
                }
                if (emailval) {
                    errors.push(`Email with email ${email} already exist`)
                    return null
                }
                if (!emailId) {
                    errors.push(`Give a proper email address ${email}`)
                    return null
                }
                if (password.length < 8) {
                    errors.push(`Minimum 8 characters is needed ${password}`)
                    return null
                }
                let count = 0
                let i;
                for (i = 0; i < password.length; i++) {
                    if (/[A-Z]/.test(password[i])) { count++ }
                    if (/[0-9]/.test(password[i])) { count++ }
                }
                if (count < 4) {
                    errors.push(`Give a strong Password ${username}`)
                    return null
                }
                const phnnumber = await UserServices.getUsersByphone(mobilephone)

                if (phnnumber) {
                    errors.push(`Phone number with ${mobilephone} already exist`)
                    return null
                }
                if (!(["Male", "Female"].includes(gender))) {
                    errors.push(`Give a proper Gender ${username}`)
                    return null
                }
                data.push({user})
                if(errors.length>0){
                    return null
                }else{
                   
                    return await UserServices.createUserWithAddress({ firstName, lastName, username, password, email, mobilephone, gender, dob }, address)
                }
            }))
            if (errors.length > 0) {
                res.status(400).json({ errors, data} );
            } else {
                res.status(201).json({data: creatingmap.filter(user =>user !== null)});
            }
        }catch (error) {
            const errorMessage: string = (error as Error).message;
            res.send(errorMessage)
        }
    }
    // Create User and Registration
    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { firstName, lastName, email, username, password, mobilephone, gender, dob, address } = req.body
            const message = {
                from:"mosescstibu@gmail.com",
                to:`${email}`,
                subject:"Congrats on registering",
                text:`Hello ${firstName} Welcome to our company.Kindly Login to explore more...`
            }
            const { zipcode, city, country, state, addresses } = address
            const emaillower = email.toLowerCase()
            const emailval = await UserServices.getusersByemail(emaillower)
            const emailId = emaillower.endsWith(".com") || emaillower.endsWith(".gov") || emaillower.endsWith(".org") || emaillower.endsWith(".in")
            const usernameval = await UserServices.getUserByUsername(username)
            if (usernameval) {
                res.status(401).json({ message: "User already exist" })
                return
            }
            if (emailval) {
                res.status(401).json({ message: "Email already exist" })
                return
            }
            if (!emailId) {
                res.status(401).json({ message: "Give a proper email Id" })
                return
            }
            if (password.length < 8) {
                res.status(401).json({ message: "Minimum 8 characters is needed" })
                return
            }
            let count = 0
            let i;
            for (i = 0; i < password.length; i++) {
                if (/[A-Z]/.test(password[i])) { count++ }
                if (/[0-9]/.test(password[i])) { count++ }
            }
            if (count < 4) {
                res.status(401).json({ message: "Give a strong Password" })
                return
            }
            const phnnumber = await UserServices.getUsersByphone(mobilephone)

            if (phnnumber) {
                res.status(401).json({ message: "Phone number already exist" })
                return
            }
            if (!(["Male", "Female"].includes(gender))) {
                res.status(401).send("Give a proper Gender")
                return
            }
            const user = await UserServices.createUserWithAddress({ firstName, lastName, email, username, mobilephone, gender, dob, password }, { country, state, city, zipcode, addresses })
            transporter.sendMail(message, function (err,info){
                if(err){
                    console.log(err)
                }
                else{
                    console.log(info.response)
                }
            })
            res.status(200).send(user)
        } catch (error) {
            console.log(error);
        }
    };

    // Login User
    loginUser = async (req: Request, res: Response, next: NextFunction) => {
        const { username, password }: RequestBody = req.body;
        try {
            const user = await UserServices.getUserByUsername(username);
            if (!user) {
                return res.status(400).json({ message: "Invalid Username" });
            }

            const passwordMatch = await compare(password, user.password as string);
            if (passwordMatch) {
                const payload = { username };
                const jwtToken = sign(payload, secret_token);
                
                return res.send({ jwtToken });
            } else {
                return res.status(400).json({ message: "Invalid Password" });
            }
        } catch (error) {
            console.log(error);

        }
    };

    // Get All Users
    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await UserServices.getUsers();
            res.send(users);
        } catch (error) {
            console.log(error);
        }
    };

    // Get User by ID
    getUser = async (req: Request, res: Response, next: NextFunction) => {
        const id = parseInt(req.params.id, 10);
        try {
            const user = await UserServices.getUser(id);
            if (user) {
                res.send(user);
            } else {
                res.status(404).send("User not found");
            }
        } catch (error) {
            console.log(error)
        }
    };

    // Update User
    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        const username = req.params.username;
        const { firstName, lastName } = req.body;
        try {
            const updateUser = await UserServices.updateUsers(username, firstName, lastName);
            if (updateUser) {
                res.json({ message: "User updated successfully" });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            console.log(error);

        }
    };
    //update and reset password
    updatepassword = async(req:Request,res:Response,next:NextFunction)=>{

        const {otp,newpassword,conformpassword,email} = req.body
        try{
            if(otp !== otp_store[0]){
                res.status(400).json({message:"Give a correct otp"})
            }
            const emailverify = await UserServices.getusersByemail(email)
            if(!(emailverify)){
                res.status(400).json({message:"Give a proper email id"})
            }
            if(emailstore[0] !== email){
                res.status(400).json({message:"Give your email id "})
            }
            if (newpassword.length < 8) {
                res.status(401).json({ message: "Minimum 8 characters is needed" })
                return
            }
            let count = 0
            let i;
            for (i = 0; i < newpassword.length; i++) {
                if (/[A-Z]/.test(newpassword[i])) { count++ }
                if (/[0-9]/.test(newpassword[i])) { count++ }
            }
            if (count < 4) {
                res.status(401).json({ message: "Give a strong Password" })
                return
            }
            const updatedResult = await UserServices.updatepassword(email,newpassword,conformpassword)
            if(updatedResult === "Password does not match"){
                res.status(400).json({message:"Password does not match"})
            }
            else if(updatedResult){
                res.status(200).json({message:"Password updated successfully"})
                otp_store = []
            }
            else{
                res.status(400).json({message:"Email not found"})
            }
        }
        catch(err){
            console.log(err)
        }
    }
    // Delete User
    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        const username = req.params.username;
        try {
            await UserServices.deleteUsers(username);
            res.send("User deleted");
        } catch (error) {
            console.log(error);

        }
    };
    //FORGET PASSWORD
    forgetUser = async(req:Request,res:Response,next: NextFunction) =>{
        const {email} = req.body;
        const emailverify = await UserServices.getusersByemail(email)
        let otp = Math.floor(1000 + Math.random() * 9000);
        if(emailverify){
            const mailOptions = {
                from: 'mosescstibu@gmail.com',
                to: `${email}`,
                subject: 'Password reset OTP',
                text: `Your OTP (It is expired after 1 min) : ${otp}`,
            };
            transporter.sendMail(mailOptions, function (err,info){
                if(err){
                    console.log(err)
                }
                else{
                    emailstore.unshift(email)
                    otp_store.unshift(otp.toString());
                    console.log(info.response)
                    res.json({data:"OTP has been sent to the email"})
                    next()

                }
            })
        }
    };
}

export class AddressController {
    createBulkAddress = async (req: Request, res: Response) => {
        const addressData = req.body;
        try {
            const user = await AddressServices.bulkAddress(addressData);
            res.send(user);
        } catch (error) {
            const errorMessage: string = (error as Error).message;
            res.send(errorMessage)
        }
    }
    createAddress = async (req: Request, res: Response) => {
        const { country, state, city, addresses, zipcode }: AddressBody = req.body;
        try {
            const addressDetails = await AddressServices.createaddress({ country, state, city, addresses, zipcode });
            res.status(201).send(addressDetails);
        } catch (error) {
            console.log(error);

        }
    };

    getAddress = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id, 10);
            const addresses = await AddressServices.getUserWithAddress(id);
            if (addresses) {
                res.send(addresses);
            } else {
                res.status(404).send("Address not found");
            }
        } catch (error) {
            console.log(error);
        }
    };
}

export const userControllers = new UserController();
export const addressControllers = new AddressController();