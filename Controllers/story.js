const asyncErrorWrapper = require("express-async-handler")
const Story = require("../Models/story");
const User = require("../Models/user");
// const deleteImageFile = require("../Helpers/Libraries/deleteImageFile");
const {searchHelper, paginateHelper} =require("../Helpers/query/queryHelpers")

const imageUpload = require("../Helpers/Libraries/imageUpload.js");
const deleteImageFile = require("../Helpers/Libraries/deleteImageFile.js");


const addStory = asyncErrorWrapper(async  (req,res,next)=> {

    const {title,location,content} = req.body 

    var wordCount = content.trim().split(/\s+/).length ; 
   
    let readtime = Math.floor(wordCount /200)   ;


    try {
        const upload = await imageUpload.uploadFile(req.file.path);
        const newStory = await Story.create({
            title,
            location,
            content,
            author :req.user._id ,
            image : upload.secure_url,
            readtime
        })

        const user = await User.findById(req.user._id )
        user.myPost.push(newStory._id)
        user.myPostLength = user.myPost.length
        await user.save();

        return res.status(200).json({
            success :true ,
            message : "add story successfully ",
            data: newStory
        })
    }

    catch(error) {

        // deleteImageFile(req)

        return next(error)
        
    }
  
})

const getAllStories = asyncErrorWrapper( async (req,res,next) =>{

    let query = Story.find();

    query =searchHelper("slug",query,req)

    // const paginationResult =await paginateHelper(Story , query ,req)

    // query = paginationResult.query  ;

    query = query.sort("-likeCount -commentCount -createdAt")

    const stories = await query
    
    return res.status(200).json(
        {
            success:true,
            // count : stories.length,
            data : stories ,
            // page : paginationResult.page ,
            // pages : paginationResult.pages
        })

})

const detailStory =asyncErrorWrapper(async(req,res,next)=>{

    const {slug}=req.params ;
    const {activeUser} =req.body 

    const story = await Story.findOne({
        slug: slug 
    }).populate("author likes")

    const storyLikeUserIds = story.likes.map(json => json.id)
    const likeStatus = storyLikeUserIds.includes(activeUser._id)


    return res.status(200).
        json({
            success:true,
            data : story,
            likeStatus:likeStatus
        })

})

const likeStory =asyncErrorWrapper(async(req,res,next)=>{

    const {activeUser} =req.body 
    const {slug} = req.params ;

    const story = await Story.findOne({
        slug: slug 
    }).populate("author likes")
   
    const storyLikeUserIds = story.likes.map(json => json._id.toString())
   
    if (! storyLikeUserIds.includes(activeUser._id)){

        story.likes.push(activeUser)
        story.likeCount = story.likes.length
        await story.save() ;  
    }
    else {

        const index = storyLikeUserIds.indexOf(activeUser._id)
        story.likes.splice(index,1)
        story.likeCount = story.likes.length

        await story.save() ; 
    }
 
    return res.status(200).
    json({
        success:true,
        data : story
    })

})

const editStoryPage = asyncErrorWrapper(async(req,res,next)=>{
    const {slug } = req.params ; 
   
    const story = await Story.findOne({
        slug: slug 
    }).populate("author likes")

    return res.status(200).
        json({
            success:true,
            data : story
    })

})


const editStory = asyncErrorWrapper(async(req,res,next)=>{
    const {slug } = req.params ; 
    const {title ,location, content ,image ,previousImage } = req.body;

    const story = await Story.findOne({slug : slug })
    

    story.title = title ;
    story.location = location;
    story.content = content ;
    story.image = previousImage ;

    // await deleteImageFile.deleteImage(previousImage);
    if(req.file != null){
        await deleteImageFile.deleteImage(previousImage);
        const upload = await imageUpload.uploadFile(req.file.path);
        story.image = upload.secure_url
    }

    await story.save();

    return res.status(200).
        json({
            success:true,
            data :story
    })

})

const deleteStory  =asyncErrorWrapper(async(req,res,next)=>{

    const {slug} = req.params  ;

    const story = await Story.findOne({slug : slug })

    await deleteImageFile.deleteImage(story.image); 

    await story.remove()

    return res.status(200).
        json({
            success:true,
            message : "Story delete succesfully "
    })

})


module.exports ={
    addStory,
    getAllStories,
    detailStory,
    likeStory,
    editStoryPage,
    editStory ,
    deleteStory
}