const express = require("express");
const User=require("../db")
const zod=require("zod");
const jwt=require("jsonwebtoken");
const JWT_SECRET = require("../config");
const router=express.Router();

const signUpschema= zod.object({
    userName:zod.string().email(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string()
})

router.post("/signUp",async (req,res)=>{
    const body= req.body;

    const {success}=signUpschema.safeParse(req.body);
    if(!success){
        return res.status(400).json({
            message:"email already taken/ invalid inputs"
        })
    }

    const user = await User.findOne({
        userName: body.userName, 
    })

    if(!user._id){
        return res.json({
            message:"email already taken/ invalid inputs"
        })
    }

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const dbUser=await User.create(body);
    const token= jwt.sign({
        userid:dbUser._id
    },JWT_SECRET)
    res.json({
        message:"user created successfully",
        token:token
    })
})

const singInschema = zod.object({
    userName:zod.string().email(),
    password:zod.string()

})

router.post("/signIn",async (req,res)=>{
    const body=req.body;

    const {success}=singInschema.safeParse(req.body);
    if(!success){
        return res.json({
            message:"invalid inputs"
        })
    }

    const user= await User.findOne({
        userName:body.userName,
        password:body.password
    })
    if(user){
        const token=jwt.sign({
            userid:user._id
        },JWT_SECRET)
        res.json(token);
        return
    }

    res.status(411).json({
        message:"error while lodding in...."
    })
})

const  { authMiddleware } = require("../middleware");


// other auth routes

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports= router;