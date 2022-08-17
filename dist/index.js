"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const const_1 = require("./const");
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const movie_1 = require("./mongoose/movie");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin");
    res.setHeader("Accept", "Content-Type");
    res.setHeader("X-Requested-With", "Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS, PATCH");
    next();
});
let dataMovies = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, 'data.json'), 'utf8'));
console.log('[source:json]:', dataMovies[0].slug);
mongoose_1.default.connect("mongodb+srv://tongquangthanh:tongquangthanh@cluster0.80gcgnc.mongodb.net/phim?retryWrites=true&w=majority")
    .then((db) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[database]: Connected to database!');
    dataMovies = yield movie_1.MovieSchema.find();
    console.log('[source:db]:', dataMovies[0].slug);
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
app.get("/data", (req, res, next) => {
    const data = {};
    fs.readdir(const_1.dataPath, (err, files) => {
        if (err) {
            res.status(500).json({ message: "Unexpected error occur. Please try again later" });
            throw err;
        }
        for (const file of files) {
            if (!file.includes('data')) {
                data[file.replace('.json', '')] = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, file), 'utf8'));
            }
        }
        res.status(200).json({ message: "Fetch successfully", data });
    });
});
app.get("/tim-kiem", (req, res, next) => {
    const page = +(req.query.page || 1) - 1;
    const limit = +(req.query.limit || 10);
    const str = req.query.str.trim().toLowerCase();
    const type = req.query.type.trim().toLowerCase();
    const genre = req.query.genre.trim().toLowerCase();
    const country = req.query.country.trim().toLowerCase();
    const status = req.query.status.trim().toLowerCase();
    const from = +req.query.from;
    const to = +req.query.to;
    try {
        const data = dataMovies.filter(m => {
            var _a, _b;
            return (((_a = m.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(str)) ||
                ((_b = m.origin_name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(str)) ||
                m.director.map(d => d.toLowerCase()).includes(str) ||
                m.actor.map(a => a.toLowerCase()).includes(str)) &&
                (!type || type.includes(m.type || '')) &&
                (!status || status.includes(m.status || '')) &&
                (!genre || m.category.some(c => genre.includes((c.name || '').trim().toLowerCase()))) &&
                (!country || m.country.some(c => country.includes((c.name || '').trim().toLowerCase()))) &&
                from <= (m.year || from) && (m.year || to) <= to;
        }).slice(limit * page, limit);
        res.status(200).json({ message: "Fetch successfully", data });
    }
    catch (error) {
        res.status(500).json({ message: "Unexpected error occur. Please try again later" });
    }
});
app.get("/danh-sach/:url", (req, res, next) => {
    var _a;
    const url = req.params.url;
    const page = +(req.query.page || 1) - 1;
    const limit = +(req.query.limit || 10);
    const selectedType = (_a = const_1.type.find(t => t.url === url)) === null || _a === void 0 ? void 0 : _a.key;
    try {
        let data;
        if (selectedType) {
            data = dataMovies.filter(m => m.type === selectedType).slice(limit * page, limit);
        }
        else {
            if (url === 'chieu-rap') {
                data = dataMovies.filter(m => m.chieurap).slice(limit * page, limit);
            }
            else {
                dataMovies.sort((a, b) => { var _a, _b; return new Date(((_a = a.modified) === null || _a === void 0 ? void 0 : _a.time) || new Date()).getTime() - new Date(((_b = b.modified) === null || _b === void 0 ? void 0 : _b.time) || new Date()).getTime(); });
                data = dataMovies.slice(limit * page, limit);
            }
        }
        res.status(200).json({ message: "Fetch successfully", data });
    }
    catch (error) {
        res.status(500).json({ message: "Unexpected error occur. Please try again later" });
    }
});
app.get("/high-light", (req, res, next) => {
    try {
        const day = new Date();
        const data = dataMovies.find(m => m.chieurap && m.status === 'completed' && m.poster_url && (m.year === day.getFullYear() || m.year === day.getFullYear() - 1)) || dataMovies[0];
        res.status(200).json({ message: "Fetch successfully", data });
    }
    catch (error) {
        res.status(500).json({ message: "Unexpected error occur. Please try again later" });
    }
});
server.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        const success = yield (0, data_1.checkRawData)();
        if (success) {
            dataMovies = yield movie_1.MovieSchema.find();
            console.log('[source:db]:', dataMovies[0].slug);
        }
    }), 1000 * 60 * 60 * 24 * 7);
}));
