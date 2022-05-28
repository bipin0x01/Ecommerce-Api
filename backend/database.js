const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

class DatabaseMongo extends mongoose.Mongoose {
  constructor(url) {
    super();
    this.connect(url);
  }

  createSchemaModel({ collectionName, schemaModel }) {
    let databaseSchema = new mongoose.Schema(schemaModel);
    let databaseModel = this.model(collectionName, databaseSchema);
    return databaseModel;
  }

  deleteFromModel(projecton, databaseModel) {
    return new Promise((resolve, reject) => {
      return databaseModel.deleteOne(projecton, (err) => {
        if (err) {
          reject("error");
        } else {
          resolve("Success");
        }
      });
    });
  }

  saveToModel(data, databaseModel) {
    return new Promise((resolve, reject) => {
      let insertTo = new databaseModel(data);
      insertTo.save((error) => {
        if (error) {
          reject(error);
        } else {
          resolve("Success");
        }
      });
    });
  }

  updateToModel(projection, queryData, databaseModel) {
    return new Promise((resolve, reject) => {
      databaseModel.updateOne(projection, queryData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async findOrCreate(query, data, options, databaseModel) {
    try {
      let data = {
        msg: "User Found",
        fetchedData: await this.fetchDatabase(query, options, databaseModel),
      };
      return data;
    } catch (err) {
      try {
        return {
          msg: "User Created",
          fetchedData: await this.saveToModel(data, databaseModel),
        };
      } catch (err) {
        return err;
      }
    }
  }

  fetchDatabase(projection, options, databaseModel) {
    return new Promise((resolve, reject) => {
      databaseModel.find(projection, options, {}, (err, result) => {
        if (result[0] != undefined) {
          resolve({ message: "Success", data: result });
        } else {
          reject({ message: "Error", data: "data not found" });
        }
      });
    });
  }

  findById(id, options, databaseModel) {
    return new Promise((resolve, reject) => {
      databaseModel.find({ _id: ObjectId(id) }, options, {}, (err, result) => {
        if (result[0] != undefined) {
          resolve({ message: "Success", data: result });
        } else if (err) {
          reject({ message: "Error", data: err });
        } else {
          reject({ message: "Error", data: "product not found" });
        }
      });
    });
  }

  paginationSearch(projection,options,databaseModel,startIndex,limit){
    return new Promise((resolve, reject) => {
      databaseModel.find(projection, options, {}, (err, result) => {
        if (result[0] != undefined) {
          resolve({ message: "Success", data: result });
        } else {
          reject({ message: "Error", data: "data not found" });
        } 
      }).skip(startIndex).limit(limit);
    });
  }

  paginationSearchLength(projection,options,databaseModel){
    return new Promise((resolve, reject) => {
      databaseModel.find(projection, options, {}, (err, result)=>{
        if(!err){
          resolve(result)
        }
        else{
          reject({ message: "Error", data: "data not found" })
        }

      }).count();

    });
  }
}

module.exports = DatabaseMongo;
