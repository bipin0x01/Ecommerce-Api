const collectionName="User"
const UserSchema={
    username:String,
    password:String,
    profile:{
        fName:{type:String},
        lName:String,
        avatar:String
    },
    role:{type:String,default:"user"}
}

module.exports={
    collectionName:collectionName,
    schemaModel:UserSchema
}