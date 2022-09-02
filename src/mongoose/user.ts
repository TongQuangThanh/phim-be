import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  movies: [String],
  genres: [String]
});

userSchema.plugin(uniqueValidator);

export const UserSchema = mongoose.model('User', userSchema);