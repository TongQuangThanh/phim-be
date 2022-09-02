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
exports.userRouters = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../mongoose/user");
const const_1 = require("../const");
exports.userRouters = express_1.default.Router();
exports.userRouters.post('/login', (req, res) => {
    user_1.UserSchema.findOne({ email: req.body.email }).then(user => {
        let token = '';
        if (user && bcrypt_1.default.compareSync(req.body.password, (user === null || user === void 0 ? void 0 : user.password) || '')) {
            token = jsonwebtoken_1.default.sign({ email: user.email, userId: user._id }, const_1.APP_NAME_TOKEN, { expiresIn: "30d" });
        }
        res.status(token ? 200 : 401).json({ message: token ? "Đăng nhập thành công" : "Email hoặc mật khẩu không đúng", data: token || null });
    })
        .catch(err => res.status(500).json({ message: "Lỗi server", data: err }));
});
exports.userRouters.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.password !== req.body.rePassword) {
        return res.status(400).json({ message: "Nhập lại mật khẩu không khớp", data: null });
    }
    const user = yield user_1.UserSchema.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "Email đã tồn tại", data: null });
    }
    bcrypt_1.default.hash(req.body.password, 10)
        .then(hash => {
        const user = new user_1.UserSchema({
            email: req.body.email,
            password: hash
        });
        user.save().then(result => {
            const token = jsonwebtoken_1.default.sign({ email: user.email, userId: result._id }, const_1.APP_NAME_TOKEN, { expiresIn: "30d" });
            res.status(201).json({ message: "Đăng ký thành công", data: token });
        });
    })
        .catch(err => res.status(500).json({ message: "Lỗi server", data: err }));
}));
