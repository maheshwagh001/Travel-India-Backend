const crypto = require("crypto")

const mongoose = require("mongoose")

const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

const UserSchema = new mongoose.Schema({

    username : {
        type :String,
        required : [true ,"Please provide a username"]
    },
    photo : {
        type : String,
        default : "https://res.cloudinary.com/dvkh2npi6/image/upload/v1721312134/obtfyywlohhs6awjnssx.jpg"
    },
    email : {
        type: String ,
        required : [true ,"Please provide a email"],
        unique : true ,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password : {
        type:String,
        minlength: [6, "Please provide a password with min length : 6 "],
        required: [true, "Please provide a password"],
        select: false
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    },
    myPost : [{
        type : mongoose.Schema.ObjectId, 
        ref : "Story"
    }],
    myPostLength: {
        type: Number,
        default: 0
    },
    readList : [{
        type : mongoose.Schema.ObjectId, 
        ref : "Story"
    }],
    readListLength: {
        type: Number,
        default: 0
    },
    resetPasswordToken : String ,
    resetPasswordExpire: Date 


},{timestamps: true})


UserSchema.pre("save" , async function (next) {

    if (!this.isModified("password")) {
        next()
    }

    const salt = await bcrypt.genSalt(10)

    this.password = await bcrypt.hash(this.password,salt)
    next() ;

})


UserSchema.methods.generateJwtFromUser  = function(){
    
    const { JWT_SECRET_KEY,JWT_EXPIRE } = process.env;

    payload = {
        id: this._id,
        username : this.username,
        email : this.email
    }

    const token = jwt.sign(payload ,JWT_SECRET_KEY, {expiresIn :JWT_EXPIRE} )

    return token 
}



const User = mongoose.model("User",UserSchema)

module.exports = User  ;