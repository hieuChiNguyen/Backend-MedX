import sequelize  from '../config/connectDB';
import * as fs from 'fs'
import * as path from "path"

// Tạo bảng
const createTable = async () => {
    const models = {};
    const modelFiles = fs.readdirSync(path.join(__dirname + "/"));
    console.log(modelFiles);

    modelFiles.forEach((file) => {
      const model = require(path.join(__dirname + "/" + file));
      models[model.name] = model;
    });

    Object.keys(models).forEach((modelName) => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    // Kiểm tra trạng thái hiện tại của cơ sở dữ liệu
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    if (tableNames.length === 0) {
        // Nếu không có bảng nào, thực hiện sync với force
        await sequelize
          .sync({ force: true, alter: true })
          .then(() => console.log("Create table successfully!"))
          .catch((error) => console.log("Error while create tables :", error))
    } else {
        console.log("Create table successfully!")
        // Nếu có bảng, chỉ thực hiện sync với alter
        // await 
        //   sequelize.sync({ alter: true })
        //   .then(() => console.log("Create table successfully!"))
        //   .catch((error) => console.log("Error while create tables :", error));
    }
  
    // sequelize
    //   .sync({ force: false, alter: true })
    //   .then(() => console.log("Create table successfully!"))
    //   .catch((error) => console.log("Error while create tables :", error));
};

module.exports = { createTable }