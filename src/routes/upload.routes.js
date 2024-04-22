import { uploadFile } from "../controllers/uploaad.controller.js";
import {Router} from "express"
import { upload } from "../controllers/uploaad.controller.js";

const router= Router();



router.route("/upload").post(upload.single('file'),uploadFile);

export default router;