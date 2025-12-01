import express from 'express';
import {login} from '../controllers/auth/authController.js';
import {register} from '../controllers/auth/registerController.js'


const router = express.Router();

router.post('/login', login);  

router.post('/register', register);

router.post("/register/mock", (req, res) => {
  console.log("📥 MOCK DATA:", req.body);

  return res.json({
    success: true,
    message: "Mock register OK — không insert DB",
    receivedData: req.body
  });
});

export default router;