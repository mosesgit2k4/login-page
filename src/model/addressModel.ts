import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import User from './userModel';

interface addressAttributes{
    id:number;
    country:string;
    state:string;
    city:string;
    addresses:string;
    zipcode:number;
  }
  interface omitid extends Omit<addressAttributes, "id"> {}
  class Address extends Model<addressAttributes,omitid>
  implements addressAttributes{
    public id!:number;
    public country!: string;
    public state!: string;
    public city!: string;
    public addresses!: string;
    public zipcode!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  }

  Address.init({
    id:{
      type:DataTypes.INTEGER,
      allowNull:false,
      primaryKey:true,
      autoIncrement:true
  },
  country:{
    type:DataTypes.STRING,
    allowNull:false
  },
  state:{
    type:DataTypes.STRING,
    allowNull:false
  },
  city:{
    type:DataTypes.STRING,
    allowNull:false
  },addresses:{
    type:DataTypes.STRING,
    allowNull:false
  },
  zipcode:{
    type:DataTypes.INTEGER,
    allowNull:false
  },
},
    {
        tableName:"address",
        sequelize,
})
export default Address