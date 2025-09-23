const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const User = require("../schemas/user.schema");

const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ mesage: "User already exists" });
    }

    const saltRounds = parseInt(process.env.SALT_ROUND);
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = new User({ email, password: hashedPassword });

    await newUser.save();

     return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
    const userInfo = await User.findOne({ email });
    if (!userInfo) {
      return res.status(400).json({ mesage: "User not exists" });
    }

    const passwordMatched = bcrypt.compareSync(password, userInfo.password);
    if (!passwordMatched) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: userInfo._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = {signup, login};