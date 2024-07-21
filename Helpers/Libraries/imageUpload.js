const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config({
    path:  '.env'
})
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

const uploadFile = async(filePath) => {

    try {
        
        const result = await cloudinary.uploader.upload(filePath);
        return result;
    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    uploadFile
}