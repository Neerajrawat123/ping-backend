import {Router} from 'express'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

const users = {}


const router = Router()

router.route('/register').post( async (req, res) => {
    const {username, password} = req.body;

    if(username === '' || password === ''){
        return res.status(300).json({msg: 'please enter the valid email or username'})
    }

    if (users[username]) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      users[username] = { password: hashedPassword };
      const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
      res.status(201).cookie('token',token).json({ message: 'User registered successfully', token});
})


router.route('/login').post( async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
    res.status(200).cookie('token', token).json({msg:'login successful', token });
  });

  export default router