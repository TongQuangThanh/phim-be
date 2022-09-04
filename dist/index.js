"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_1 = require("./data");
const axios_1 = __importDefault(require("axios"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("./routers/user");
const movie_1 = require("./routers/movie");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, Accept, Content-Type, X-Requested-With, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS, PATCH");
    next();
});
mongoose_1.default.connect("mongodb+srv://tongquangthanh:tongquangthanh@cluster0.80gcgnc.mongodb.net/phim?w=majority")
    .then((db) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[database]: Connected to database!');
}));
const normalizePort = (val) => {
    const port = parseInt(val, 10);
    if (isNaN(port))
        return val;
    if (port >= 0)
        return port;
    return false;
};
const port = normalizePort(process.env.PORT || "3080");
app.set('port', port);
const server = http_1.default.createServer(app);
server.on("error", (error) => {
    if (error.syscall !== "listen")
        throw error;
});
app.get("/", (req, res, next) => {
    res.send('Welcome!!!');
});
app.use("/", movie_1.movieRouters);
app.use("/user", user_1.userRouters);
server.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[server]: Server is running, current time: `, new Date());
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () { return console.log((yield axios_1.default.get('https://phim-be.herokuapp.com/data')).data); }), 1000 * 60 * (29 - 0.1)); // 29.9p
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () { return (0, data_1.checkRawData)(); }), 1000 * 60 * 60 * 24); // 1n
}));
