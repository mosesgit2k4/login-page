import {Request,Response} from "express";
import User from "../model/userModel";
import Address from "../model/addressModel";
import { UpdateDateColumn } from "typeorm";
import bcrypt from "bcrypt";

interface Createusers {
  firstName: string;
  lastName: string;
  username:string;
  email:string;
  password:string;
  mobilephone:number;
  dob:string;
  gender:string;
  }
interface createAddress {
    country:string;
    state:string;
    city:string;
    addresses:string;
    zipcode:number;
}


class UserService {
    async createUserWithAddress(userData: Createusers, address:createAddress) : Promise<object> {
        try{
            const addressval = await Address.create(address);
            const user = await User.create({ ...userData, addressId: addressval.id });
            const {password,...users} = user.toJSON()
            const address_user = {...users,addressId:addressval.id,address}
            return address_user
        }
        catch(err){
            console.log(err)
            return {message: "There is an error"}
        }
      }
    async getUsersByphone(mobilephone:number){
        try{
            return User.findOne({where:{mobilephone}})
        }catch(error){
            console.log(error)
        }
    }
    async getusersByemail(email:string){
        try{
            return User.findOne({where:{email}})
        }catch(error){
            console.log(error)
        }
    }
    async getUserByUsername(username: string){
        try{
            return User.findOne({ where: { username } });
          }catch(error){
            console.log(error)
          }
        }

    async getUsers(){
        try{
            const users = await User.findAll({include:[
                {
                    model:Address,
                    attributes:['id','country','state','city','zipcode','addresses']
                }
            ]})
            return users
        }
        catch(error){
            console.log(error)
        }
    }
    async getUser(id: number){
        try {
            const user = await User.findByPk(id,{include:[
                {model:Address,
                    attributes:['id', 'country', 'state', 'city', 'zipcode','addresses']
                }]});
            if (!user) {
                return 'Post not available';
            }
            const {password,...userwithoutpassword} = user.toJSON()
            return userwithoutpassword;
        } catch (error) {
            console.log(error);
            return 'Error occurred';
        }
    }
    async updateUsers(username:string,newfirstName:string,newlastName:string){
        try{
            const [updated] = await User.update({ firstName: newfirstName, lastName: newlastName },{
                where: {username},
                returning:true,
            });
            return updated;
    }catch(error){
        console.log(error)
        return 'Error occured'
    }}
    async updatepassword(email:string,newpassword:string,conformpassword:string){
        if(newpassword!==conformpassword){
            return "Password does not match"
        }
        try{
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            
                const [update] = await User.update({password:hashedPassword},{
                    where:{email},
                    returning:true});
                if(update === 0){
                    return null
                }
                return true
        }
        catch(error){
            console.log(error)
            return 'Error occured'
        }
}
    async deleteUsers(username:string){
        try{
            const post = await User.destroy({
                where: {username}})
            if(!post){
                return 'user not avaiable'
            }
            return 'user deleted'
        }
        catch(error){
            console.log(error)
            return 'Error occured';
        }
    }
    async restoreUsers(username:string){
        try{
            const res = await User.restore({
                where: {username},})
            return res
        }catch(error){
            console.log(error)
            return 'Error occured'
        }
    }
    isValidDate(dateString: string): boolean {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }
}



class AddressService{
    async bulkAddress(add: createAddress[]){
        try{
            const bulkAddress = await Address.bulkCreate(add)
            return bulkAddress
        }catch(error){
            console.log(error)
        }
    }
    async createaddress(add: createAddress){
        try{
            const newuser = await Address.create(add)
            return newuser
        }
        catch(error){
            console.log(error)
        }
    }
    async  getUserWithAddress(id: number) {
        try{
            const getaddress = await Address.findByPk(id)
            return getaddress;
    }
    catch(error) {
        console.log(error);
      }
}

}


export const UserServices = new UserService()
export const AddressServices = new AddressService()
