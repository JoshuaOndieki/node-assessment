import { Request, RequestHandler, Response } from "express";
import {v4 as uid} from 'uuid'
import bcrypt from 'bcrypt'
import DatabaseHelper from "../helpers/dbHelper";
import { signupSchema } from "../validation/userValidator";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path:path.resolve(__dirname, '../../.env')});

interface IUser{
    id:string
    name:string
    email:string
    password:string
}

interface IaddUserRequest extends Request{
    body:{
       name:string
       email:string
       password:string
    }
}


const db = DatabaseHelper.getInstance()

export const addUser = async (req:IaddUserRequest, res:Response)=>{
    try {
        const {error}= signupSchema.validate(req.body)
        if(error){ return res.status(404).json(error.details[0].message )}
        let id = uid()
        let {name, email, password} =req.body
        password = await bcrypt.hash(password,10)

        await db.exec('addUser', {id, name, email, password})
        const payload = {id, name, email}
        const token = jwt.sign(payload, process.env.SECRET_KEY as string, {expiresIn:"43200s"}) //valid for 5 days
        
        return res.status(201).json({
            message:`User ${name} <${email}> has been registered successfully.`,
            userId: id,
            token: token
        })
    }
    catch (error:any) { return res.status(500).json(error.message) }
}

export const resetPassword = async (req:Request<{email:string}>, res:Response)=>{
    try {
        let {password} =req.body
        password = await bcrypt.hash(password,10)
        const {email}=req.query as {email:string}

        let user = await db.exec('getUserByEmail', {email})
        if(!user){
            return res.status(404).json({message:`${email} is not a registered user.`})
        }

        await db.exec('resetPassword', {email, password})
        return res.status(200).json({message:`Password reset for <${email}> was successful.`})
    }
    catch (error:any) { return res.status(500).json(error.message) }
}

export const signinUser= async (req:Request, res:Response)=>{
    try {
        const{email,password}= req.body

        let user= await (await db.exec('getUserByEmail', {email})).recordset[0]

        if(!user){ return res.status(404).json({message:"User not Found"}) }
    
        let validPassword = await bcrypt.compare(password,user.password)
        if(!validPassword){ return res.status(404).json({message:`Incorrect credentials or user <${email}> not registered`}) }
    
        const payload= {'id': user.id, 'name':user.name, 'email':user.email}
        const token = jwt.sign(payload, process.env.SECRET_KEY as string, {expiresIn:"43200s"}) 
        res.status(200).json({email,token})
    }
    catch (error:any) { return res.status(500).json(error.message) }
}


export const searchUsersByName:RequestHandler = async (req,res)=>{
    try {
        const {name}=req.query as {name:string}

        let allUsers:IUser[] = (await db.exec('getAllUsers')).recordset

        let filteredUsers = allUsers.filter(user => {
            return user.name == name
        })
        if(filteredUsers.length){
            return res.status(200).json(filteredUsers)
        }

        return res.status(404).json({message:`No users found matching name: ${name}`})
    }
    catch (error:any) { return res.status(500).json(error.message) }
}
