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
exports.movieRouters = void 0;
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const express_1 = __importDefault(require("express"));
const slugify_1 = __importDefault(require("slugify"));
const const_1 = require("../const");
const movie_1 = require("../mongoose/movie");
exports.movieRouters = express_1.default.Router();
const limit = 6;
let dataMovies = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, 'data.json'), 'utf8'));
let filterType = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, 'type.json'), 'utf8'));
let filterStatus = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, 'status.json'), 'utf8'));
let filterCountry = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, 'country.json'), 'utf8'));
let filterCategory = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, 'category.json'), 'utf8'));
exports.movieRouters.get("/data", (req, res) => {
    const data = {};
    fs.readdir(const_1.dataPath, (err, files) => {
        if (err) {
            res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
        }
        for (const file of files) {
            if (!file.includes('data')) {
                data[file.replace('.json', '')] = JSON.parse(fs.readFileSync(path_1.default.join(const_1.dataPath, file), 'utf8'));
            }
        }
        res.status(200).json({ message: "Fetch successfully", data });
    });
});
exports.movieRouters.get("/tim-kiem", (req, res) => {
    const page = +(req.query.page || 1) - 1;
    const limit = +(req.query.limit || 10);
    const str = req.query.str.trim().toLowerCase();
    const type = parseQuery(req.query.type, 'type');
    const genre = parseQuery(req.query.genre, 'category');
    const status = parseQuery(req.query.status, 'status');
    const country = parseQuery(req.query.country, 'country');
    const from = +req.query.from;
    const to = +req.query.to;
    try {
        // const data = dataMovies.filter(m =>
        //   (
        //     m.name?.toLowerCase().includes(str) ||
        //     m.slug?.toLowerCase().includes(str) ||
        //     m.origin_name?.toLowerCase().includes(str) ||
        //     m.director.map(d => d.toLowerCase()).includes(str) ||
        //     m.actor.map(a => a.toLowerCase()).includes(str)
        //   ) &&
        //   type.includes(m.type || '') &&
        //   status.includes(m.status || '') &&
        //   m.category.some(c => genre.includes(c.name || '')) &&
        //   m.country.some(c => country.includes(c.name || '')) &&
        //   from <= (m.year || from) && (m.year || to) <= to
        // );
        // console.log(data.length);
        const match = {
            $and: [{ year: { $gte: from } }, { year: { $lte: to } }],
            type: { $in: type },
            status: { $in: status },
            'category.name': { $in: genre },
            'country.name': { $in: country },
            $where: function () {
                return this.director.join().toLowerCase().includes(str) || this.actor.join().toLowerCase().includes(str);
            }
        };
        if (str) {
            match['$text'] = { $search: `\"${str}\"` };
        }
        movie_1.MovieSchema.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            facet(limit, page)
        ]).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
    }
    catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
});
exports.movieRouters.get("/quoc-gia/:url", (req, res) => {
    const url = req.params.url;
    const page = +(req.query.page || 1) - 1;
    const limit = +(req.query.limit || 10);
    const prefer = parseQuery(req.query.prefer, 'category');
    const country = filterCountry.find(c => (0, slugify_1.default)(c) === url);
    try {
        movie_1.MovieSchema.aggregate([
            { $match: { 'country.name': country } },
            { $sort: { createdAt: -1 } },
            facet(limit, page)
        ]).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
    }
    catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
});
exports.movieRouters.get("/the-loai/:url", (req, res) => {
    const url = req.params.url;
    const page = +(req.query.page || 1) - 1;
    const limit = +(req.query.limit || 10);
    const prefer = parseQuery(req.query.prefer, 'category');
    const category = filterCategory.find(c => (0, slugify_1.default)(c) === url);
    try {
        movie_1.MovieSchema.aggregate([
            { $match: { 'category.name': category } },
            { $sort: { createdAt: -1 } },
            facet(limit, page)
        ]).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
    }
    catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
});
exports.movieRouters.get("/danh-sach/:url", (req, res) => {
    var _a;
    const url = req.params.url;
    const page = +(req.query.page || 1) - 1;
    const limit = +(req.query.limit || 10);
    const prefer = parseQuery(req.query.prefer, 'category');
    const selectedType = (_a = const_1.type.find(t => t.url === url)) === null || _a === void 0 ? void 0 : _a.key;
    try {
        let match = { type: selectedType };
        let sort = { createdAt: -1 };
        if (url === 'chieu-rap') {
            match = { chieurap: true };
        }
        else if (!selectedType) {
            match = { year: { $lte: 1 } };
            sort = { 'modified.time': -1 };
        }
        movie_1.MovieSchema.aggregate([
            { $match: match },
            { $sort: sort },
            facet(limit, page)
        ]).then(result => res.status(200).json({ message: "Fetch successfully", data: result[0] }));
    }
    catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
});
exports.movieRouters.get("/home", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prefer = parseQuery(req.query.prefer, 'category');
    try {
        let data = {};
        for (const t of const_1.type) {
            data[t.key] = yield movie_1.MovieSchema.find({ type: t.key }, null, { limit }).sort({ 'modified.time': -1 });
        }
        data['cinema'] = yield movie_1.MovieSchema.find({ chieurap: true }, null, { limit }).sort({ 'modified.time': -1 });
        data['latest'] = yield movie_1.MovieSchema.find({}, null, { limit }).sort({ 'modified.time': -1 });
        res.status(200).json({ message: "Fetch successfully", data });
    }
    catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
}));
exports.movieRouters.get("/de-xuat", (req, res) => {
    const prefer = parseQuery(req.query.prefer, 'category');
    const currentCategory = parseQuery(req.query.category, 'category');
    const mixPrefer = [...new Set(prefer.concat(currentCategory))];
    const limit = +(req.query.limit || 10);
    try {
        movie_1.MovieSchema.find({ 'category.name': { $in: mixPrefer } }, null, { limit }).sort({ 'modified.time': -1 })
            .then(data => res.status(200).json({ message: "Fetch successfully", data }));
    }
    catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
});
exports.movieRouters.get("/high-light", (req, res) => {
    const prefer = parseQuery(req.query.prefer, 'category');
    try {
        const day = new Date();
        movie_1.MovieSchema.findOne({
            chieurap: true,
            status: 'completed',
            poster_url: { $ne: null },
            $or: [{ year: day.getFullYear() }, { year: day.getFullYear() - 1 }],
        }, (err, data) => {
            if (err) {
                res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
            }
            else {
                res.status(200).json({ message: "Fetch successfully", data: data || dataMovies[0] });
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Có lỗi xảy ra. Vui lòng thử lại sau!!!" });
    }
});
const facet = (limit, page) => {
    return {
        $facet: {
            totalRecords: [{ $count: "total" }],
            movies: [
                { $skip: limit * page },
                { $limit: limit }
            ]
        }
    };
};
const parseQuery = (q, statement) => {
    if (q)
        return q.split(',');
    switch (statement) {
        case 'type':
            return filterType;
        case 'status':
            return filterStatus;
        case 'country':
            return filterCountry;
        case 'category':
            return filterCategory;
    }
};
