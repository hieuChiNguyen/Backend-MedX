import express from 'express';
import bodyParser from 'body-parser'; // lấy các tham số client sử dụng
import viewEngine from './config/viewEngine';
import cors from 'cors';
import initWebRoutes from './route/web';
import sequelize  from './config/connectDB';
import 'dotenv/config';
import { createTable } from './model';

let app = express();
app.use(cors({ origin: true, credentials: true }));

// config body parser
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

viewEngine(app);
initWebRoutes(app);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        createTable()
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

connectDB();

const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Server start on port ${port}`);
});
