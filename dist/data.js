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
exports.checkRawData = exports.url = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const movie_1 = require("./mongoose/movie");
let category = [];
let country = [];
let type = [];
let status = [];
let quality = [];
let lang = [];
let year = [];
const data = [];
axios_1.default.defaults.httpsAgent = new https_1.default.Agent({ keepAlive: true });
exports.url = 'https://ophim1.com';
const checkRawData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const time = Date.now();
        const name = [];
        let totalPages = 683;
        for (let i = 1; i <= totalPages; i++) {
            // console.log(`${i}/${totalPages}`, (Date.now() - time) / 1000);
            const moviesURL = encodeURI(`${exports.url}/danh-sach/phim-moi-cap-nhat?page=${i}`);
            const movies = yield (yield axios_1.default.get(moviesURL)).data;
            totalPages = movies.pagination.totalPages;
            for (const m of movies.items) {
                const movieURL = encodeURI(`${exports.url}/phim/${m.slug.replaceAll('‑', '-')}`);
                const request = yield axios_1.default.get(movieURL, {
                    validateStatus: function (status) {
                        return status < 500; // Resolve only if the status code is less than 500
                    }
                });
                if (request.status > 299 || !request.data.status) {
                    continue;
                }
                const movie = request.data.movie;
                if (name.includes(movie.name)) {
                    continue;
                }
                else {
                    name.push(movie.name);
                }
                data.push(movie);
                if (movie.category) {
                    for (const c of movie.category) {
                        category = addToArray(category, c.name);
                    }
                }
                if (movie.country) {
                    for (const c of movie.country) {
                        country = addToArray(country, c.name);
                    }
                }
                type = addToArray(type, movie.type);
                status = addToArray(status, movie.status);
                quality = addToArray(quality, movie.quality);
                lang = addToArray(lang, movie.lang);
                year = addToArray(year, movie.year);
            }
        }
        yield movie_1.MovieSchema.deleteMany();
        const step = 1000;
        const len = Math.ceil(data.length / step);
        for (let i = 0; i <= len; i++) { // 18k - 1 2 3 ... 18
            const idx = i * step;
            const added = data.slice(idx, idx + step);
            yield movie_1.MovieSchema.insertMany(added);
            // console.log(idx, len);
        }
        console.log((Date.now() - time) / 3600000);
    }
    catch (error) {
        console.error(error);
        return false;
    }
    return true;
});
exports.checkRawData = checkRawData;
const addToArray = (arr, item) => {
    if (item && !arr.includes(item)) {
        arr.push(item);
    }
    return arr;
};
