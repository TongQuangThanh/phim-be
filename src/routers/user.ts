import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserSchema } from '../mongoose/user'
import { APP_NAME_TOKEN } from '../const';
export const userRouters = express.Router();

userRouters.post('/login', (req, res) => {
  UserSchema.findOne({ email: req.body.email }).then(user => {
    let token = '';
    if (user && bcrypt.compareSync(req.body.password, user?.password || '')) {
      token = jwt.sign({ email: user.email, userId: user._id }, APP_NAME_TOKEN, { expiresIn: "30d" });
    }
    res.status(token ? 200 : 401).json({ message: token ? "Đăng nhập thành công" : "Email hoặc mật khẩu không đúng", data: token || null });
  })
    .catch(err => res.status(500).json({ message: "Lỗi server", data: err }));
});

userRouters.post('/register', async (req, res) => {
  if (req.body.password !== req.body.rePassword) {
    return res.status(400).json({ message: "Nhập lại mật khẩu không khớp", data: null });
  }
  const user = await UserSchema.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "Email đã tồn tại", data: null });
  }
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new UserSchema({
        email: req.body.email,
        password: hash
      });
      user.save().then(result => {
        const token = jwt.sign({ email: user.email, userId: result._id }, APP_NAME_TOKEN, { expiresIn: "30d" });
        res.status(201).json({ message: "Đăng ký thành công", data: token });
      });
    })
    .catch(err => res.status(500).json({ message: "Lỗi server", data: err }));
});
