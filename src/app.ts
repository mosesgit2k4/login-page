import express from "express";
import sequelize from "./config/database";
import {router} from "./router";

const app = express();

app.use(express.json())

app.use('/api',router)

sequelize.authenticate().then(()=>{
  console.log("Database connected");
}).catch((err)=>{
  console.log('Error at db connect ....',err);
})

sequelize.sync({alter:true}).then(()=>{
  console.log("Table created");
}).catch((err)=>{
  console.log("Error at creating table")
})




export default app;

