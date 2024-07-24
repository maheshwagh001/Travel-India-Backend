const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv");

dotenv.config({
    path:  '.env'
})
   



cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
}); 

const deleteImage = async (public_id) => {
      await cloudinary.uploader.destroy(public_id)
        .catch(_err=> console.log("Something went wrong, please try again later."));
}

module.exports = {
    deleteImage
}
