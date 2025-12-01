import express from 'express'; 
import { verifyToken } from "../../middlewares/verifyToken.js";
import { ThemBanGhi , getAll_BMI , getAll_CanNang , getDetail_CN_BMI } from '../../controllers/userController/CanNangVaBMI/ThemBanGhi.js';


const router = express.Router();

router.get('/getAll_BMI' , verifyToken , getAll_BMI)
router.get('/getAll_CanNang' , verifyToken , getAll_CanNang)
router.get('/getDetail_CN_BMI' , verifyToken , getDetail_CN_BMI)

router.post("/ThemBanGhi", verifyToken, ThemBanGhi);

export default router;
