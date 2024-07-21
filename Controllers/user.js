const asyncErrorWrapper = require("express-async-handler")
const User = require("../Models/user");
const Story = require("../Models/story");

const imageUpload = require("../Helpers/Libraries/imageUpload.js");
const deleteImageFile = require("../Helpers/Libraries/deleteImageFile.js")


const profile = asyncErrorWrapper(async (req, res, next) => {

    return res.status(200).json({
        success: true,
        data: req.user
    })

})


const editProfile = asyncErrorWrapper(async (req, res, next) => {

    const { email, username,photo ,previousPhoto } = req.body

    const user = await User.findById(req.user.id);
    
    user.email = email;
    user.username = username;
    user.photo = previousPhoto;

    if(req.file != null){
        if(previousPhoto != "https://res.cloudinary.com/dvkh2npi6/image/upload/v1721312134/obtfyywlohhs6awjnssx.jpg"){
            await deleteImageFile.deleteImage(previousPhoto);
        }
        
        const upload = await imageUpload.uploadFile(req.file.path);
        user.photo = upload.secure_url
    }

    await user.save();

    return res.status(200).json({
        success: true,
        data: user

    })

})


const addStoryToReadList = asyncErrorWrapper(async (req, res, next) => {

    const { slug } = req.params
    const { activeUser } = req.body;

    const story = await Story.findOne({ slug })

    const user = await User.findById(activeUser._id)

    if (!user.readList.includes(story.id)) {

        user.readList.push(story.id)
        user.readListLength = user.readList.length
        await user.save();
    }

    else {
        const index = user.readList.indexOf(story.id)
        user.readList.splice(index, 1)
        user.readListLength = user.readList.length
        await user.save();
    }

    const status = user.readList.includes(story.id)

    return res.status(200).json({
        success: true,
        story: story,
        user: user,
        status: status
    })

})


const myPost = asyncErrorWrapper(async (req, res, next) => {

    const user = await User.findById(req.user.id)
    const myPost = []

    for (let index = 0; index < user.myPost.length; index++) {

        var story = await Story.findById(user.myPost[index]).populate("author")
        if(story != null){
            myPost.push(story)
        }
        if(story == null){
            user.myPost.splice(index, 1)
            index--;
            await user.save();
        }
        // readList.push(story)
        // user.readListLength = readList.length

    }

    return res.status(200).json({
        success: true,
        data: myPost
    })

})

const readListPage = asyncErrorWrapper(async (req, res, next) => {

    const user = await User.findById(req.user.id)
    const readList = []

    for (let index = 0; index < user.readList.length; index++) {

        var story = await Story.findById(user.readList[index]).populate("author")
        if(story != null){
            readList.push(story)
        }
        if(story == null){
            user.readList.splice(index, 1)
            index--;
            await user.save();
        }
        // readList.push(story)
        // user.readListLength = readList.length

    }
    return res.status(200).json({
        success: true,
        data: readList
    })

})

// ----------------------------------------------------------------------------------------------------------------------------------------------

const generatePlanner = asyncErrorWrapper(async (req, res) => {
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    const { destination, startDate, endDate } = req.body;

    const { FunctionDeclarationSchemaType } = require('@google/generative-ai');

    let model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
            responseMimeType: "application/json",
            // maxOutputTokens: 1000,
            responseSchema: {
                type: FunctionDeclarationSchemaType.ARRAY,
                items: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        day: {
                            type: FunctionDeclarationSchemaType.STRING,
                        },
                        activities: {
                            type: FunctionDeclarationSchemaType.STRING,
                        },
                    },
                },
            },
        }
    });

    const prompt = `
    If the destinion is not popular or outside India then give sorry message in attribute object.
    Else,
    Plan a travel itinerary for a trip to ${destination} starting from ${startDate} till ${endDate}. The itinerary should include activities for each day in the following format in detail:
    MOST IMPORTANT ->(Create a new avtivity string value for each day.)
    Strictly follow the following routine for each day:
    Suggest a place to have breakfast. Recommend a popular tourist spot or activity. Suggest a place to have lunch. Recommend another tourist spot or activity. Recommend another tourist spot or activity. Suggest a place to have dinner.
    Ensure that the itinerary is varied and includes a mix of cultural, historical, and recreational activities.
    MOST IMPORTANT -> If the destinion is outside India then do not give answer in attribute object.
  
    `;
    let result = await model.generateContent(prompt);
    let responseJson = JSON.parse(result.response.text());
    const itinerary = responseJson.map(day => day.activities);
    res.json(itinerary);
});

// -----------------------------------------------------------------------------------------------------------------------------------

module.exports = {
    profile,
    editProfile,
    myPost,
    addStoryToReadList,
    readListPage,
    generatePlanner
}
