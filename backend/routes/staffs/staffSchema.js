const collectionName = "staffs";
const staffschema = {
  username: String,
  password: String,
  email: String,
  contactNumber: String,
  profile: {
    fName: String,
    lName: String,
    avatar: String,
    address: String,
  },
  role: { type: String, default: "delivery" },
  cashCollected: { type: Number, default: 0 },
};

module.exports = {
  collectionName: collectionName,
  schemaModel: staffschema,
};
