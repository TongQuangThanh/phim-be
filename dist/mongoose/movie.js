"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const movieSchema = new mongoose_1.default.Schema({
    modified: { time: Date },
    _id: String,
    name: String,
    origin_name: String,
    content: String,
    type: String,
    status: String,
    thumb_url: String,
    poster_url: String,
    is_copyright: String,
    sub_docquyen: String,
    chieurap: Boolean,
    trailer_url: String,
    time: String,
    episode_current: String,
    episode_total: String,
    quality: String,
    lang: String,
    notify: String,
    showtimes: String,
    slug: String,
    year: Number,
    actor: [String],
    director: [String],
    category: [{ name: String }],
    country: [{ name: String }],
});
movieSchema.index({ name: 'text', origin_name: 'text', slug: 'text' });
const model = mongoose_1.default.model('Movie', movieSchema);
model.createIndexes();
exports.MovieSchema = model;
