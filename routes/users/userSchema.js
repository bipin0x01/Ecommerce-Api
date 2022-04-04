const collectionName="User"
const UserSchema={
    username:String,
    password:String,
    isAdmin:{
        type:Boolean,
        default:false
    },
    profile:{
        fName:{type:String},
        lName:String,
        avatar:String
    }
}

module.exports={
    collectionName:collectionName,
    schemaModel:UserSchema
}