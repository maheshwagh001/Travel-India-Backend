const express = require("express")

const imageUpload = require("../Helpers/Libraries/imageUpload");

const {profile,editProfile,changePassword,addStoryToReadList,readListPage, myPost, generatePlanner} = require("../Controllers/user");
const { getAccessToRoute } = require("../Middlewares/Authorization/auth");

const multer = require('multer');

var uploader = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: 2000000 }
});

const router = express.Router() ;

router.get("/profile",getAccessToRoute ,profile)

router.post("/editProfile",[getAccessToRoute ,uploader.single("photo")],editProfile)

router.get("/myPost", getAccessToRoute ,myPost)

router.post("/:slug/addStoryToReadList",getAccessToRoute ,addStoryToReadList)

router.get("/readList",getAccessToRoute ,readListPage)

router.post("/planner", generatePlanner)



module.exports = router