const asyncErrorWrapper = require("express-async-handler")
const Story = require("../Models/story");
const Comment = require("../Models/comment");

const addNewCommentToStory  =asyncErrorWrapper(async(req,res,next)=> {

    const {slug} = req.params 

    const { content } =req.body 

    const story = await Story.findOne({slug :slug })

    const comment = await Comment.create({

        story :story._id ,
        content :content ,
        author : req.user.id ,
    })

    story.comments.push(comment._id)

    story.commentCount = story.comments.length

    await story.save();

    return res.status(200).json({
        success :true  , 
        data : comment 
    })

})


const getAllCommentByStory = asyncErrorWrapper(async(req, res, next) => {

    const { slug } = req.params

    const story = await Story.findOne({slug:slug})

    const commmentList =await Comment.find({
        story : story._id 
    }).populate({
        path :"author",
        select:"username photo"
    }).sort("-createdAt")

    return res.status(200)
        .json({
            success: true,
            count: story.commentCount,
            data: commmentList
        })

})

const commentLike = asyncErrorWrapper(async(req, res, next) => {

    const { activeUser} =  req.body 
    const { comment_id} =  req.params 
    if(activeUser._id == null){
        return res.status(200)
        .json({
            success: false,
            data : comment,
            likeStatus:false
        })
    }

    const comment = await Comment.findById(comment_id)

    if (!comment.likes.includes(activeUser._id)) {

        comment.likes.push(activeUser._id)
        comment.likeCount = comment.likes.length ;

        await comment.save()  ;

    }
    else {

        const index = comment.likes.indexOf(activeUser._id)
        comment.likes.splice(index, 1)
        comment.likeCount = comment.likes.length
        await comment.save()  ;
    }

    const likeStatus = comment.likes.includes(activeUser._id)
    
    return res.status(200)
        .json({
            success: true,
            data : comment,
            likeStatus:likeStatus
        })

})

const getCommentLikeStatus = asyncErrorWrapper(async(req, res, next) => {

    const { activeUser} =  req.body 
    const { comment_id} =  req.params 

    const comment = await Comment.findById(comment_id)
    const likeStatus = comment.likes.includes(activeUser._id)

    return res.status(200)
    .json({
        success: true,
        likeStatus:likeStatus
    })

})


const deleteComment  =asyncErrorWrapper(async(req,res,next)=>{

    const {comment_id} = req.params  ;

    const comment = await Comment.findById(comment_id);

    const story = await Story.findById(comment.story);

    const index = story.comments.indexOf(comment_id);
    story.comments.splice(index, 1);
    story.commentCount = story.comments.length;
    await story.save()  ;
    await Comment.findByIdAndDelete(comment_id);


    return res.status(200).
        json({
            success:true,
            message : "Story delete succesfully "
    })

})

module.exports ={
    addNewCommentToStory,
    getAllCommentByStory,
    commentLike,
    getCommentLikeStatus,
    deleteComment
}