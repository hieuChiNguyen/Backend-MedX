import express from 'express';

let configViewEngine = (app) => {
    // Ảnh trên server chỉ được lấy trong thư mục public
    app.use(express.static('./src/public'));
};

module.exports = configViewEngine;
