import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from "bcrypt";
import Address from './addressModel';
interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  username:string;
  email:string;
  mobilephone:number;
  dob:string;
  gender:string;
  password:string;
  addressId:number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public mobilephone!: number;
  public id!: number; 
  public firstName!: string;
  public lastName!: string;
  public password!: string;
  public username!: string;
  public email!: string;
  public dob!: string;
  public gender!: string;
  public addressId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username:{
      type:DataTypes.STRING,
      allowNull:false
    },
    password:{
      type:DataTypes.STRING,
      allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    gender:{
        type:DataTypes.STRING,
        allowNull :false
    },
    mobilephone:{
        type:DataTypes.BIGINT,
        allowNull:false
    },
    dob :{
        type:DataTypes.STRING,
        allowNull:false
    },
    addressId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      references: {
        model: Address, 
        key: 'id',
      },
    }
  },

  {
    tableName:"users",
    sequelize,
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await User.hashPassword(user.password);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await User.hashPassword(user.password);
        }
      },
    },
  }
);
Address.hasMany(User,{foreignKey:"addressId"})
User.belongsTo(Address,{foreignKey:"addressId"})
export default User;