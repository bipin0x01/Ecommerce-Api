const collectionName = "staffsAccount";
const accountSchema = {
  staffName: String,
  cashed: String,
  date: { type: Date, default: Date() },
};

module.exports = {
  collectionName: collectionName,
  schemaModel: accountSchema,
};
