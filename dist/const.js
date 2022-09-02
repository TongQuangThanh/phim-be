"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.typeObj = exports.APP_NAME_TOKEN = exports.APP_NAME = exports.dataPath = void 0;
exports.dataPath = './data';
exports.APP_NAME = 'thnvn_phim_';
exports.APP_NAME_TOKEN = exports.APP_NAME + 'token';
exports.typeObj = {
    series: "series",
    single: "single",
    anime: "hoathinh",
    shows: "tvshows",
};
exports.type = [
    {
        key: "series",
        url: "phim-bo"
    },
    {
        key: "single",
        url: "phim-le"
    },
    {
        key: "hoathinh",
        url: "hoat-hinh"
    },
    {
        key: "tvshows",
        url: "tv-shows"
    },
    {
        key: "cinema",
        url: "chieu-rap"
    },
    {
        key: "latest",
        url: "moi-nhat"
    }
];
