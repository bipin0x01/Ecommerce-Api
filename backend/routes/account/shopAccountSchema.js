const collectionName = "shopAccountSchema";
const ShopAccountSchema = {
  cashed: Number,
  date: { type: Date, default: Date() },
};

module.exports = {
  collectionName: collectionName,
  schemaModel: ShopAccountSchema,
};
