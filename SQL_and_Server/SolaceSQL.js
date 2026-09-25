import * as controller from 'mysql2'
import dbSecurity from './dbSecurity.js'
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync, rmdirSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import mcache from 'memory-cache'
import sharp from 'sharp'
import QueryString from 'qs'

const connectionString = controller.createPool({
    host: readFileSync('./cred/db/dbhost.pem', 'utf8'),
    user: readFileSync('./cred/db/user.pem', 'utf8'),
    password: readFileSync('./cred/db/dbpass.pem', 'utf8'),
    database: readFileSync('./cred/db/db.pem', 'utf8'),
    multipleStatements: true
    /* 
    host: "<ip address>",
    user: "<username>",
    password: "<user password>",
    database: "solace journey",
    multipleStatements: true
    */
    // Implement .env file for security
})

const queries = { 
    // Adding
    "addUser" : "insert ignore into Users (Username, Password, Email, Picture) values(?, ?, ?, ?)",
    "addAdmin" : "insert ignore into Users (Username, Password, Email, Administrator, Picture) values(?, ?, ?, ?, ?)",
    "addActivity" : "insert ignore into Activities (Name, Contents, `Main Image`, `Main Video`, Administrator) values(?, ?, ?, ?, ?)",
    "addActivityPictures" : "insert ignore into `Activity Pictures` (activityID, picture, Step, `Step Description`)",
    "addActivityVideos" : "insert ignore into `Activity Videos` (activityID, video, Step, `Step Description`)",
    "addMessage" : "insert ignore into Messages values(?, ?, ?)",
    "addHiking" : "insert ignore into `Hiking Trail` values(?, ?, ?, ?, ?)",
    "addPost" : "insert ignore into Posts (Administrator, `Post Content`) values(?, ?)",
    "addPostWithPicture" : "insert ignore into Posts (Administrator, `Post Content`, `Post Image`) values(?, ?, ?)",
    "addComment" : "insert ignore into Comments (User, `Comment Content`, Posted, postID) values(?, ?, ?, ?)",
    "addReply" : "insert ignore into Replies (User, `Reply Content`, Posted, commentID) values (?, ?, ?, ?)",
    "addWaypoint" : "insert ignore into Waypoints values(?, ?, ?, ?)",
    "addFriend": "insert ignore into Friends (User, Friend, `Creation Date`, Chat) values (?, ?, ?, ?), (?, ?, ?, ?)",

    "addActivityTag" : "insert ignore into `Activity Tags` values(?, ?)",
    "addUserTagNoRec" : "insert ignore into `User Recommendations` (Username, Tags) values(?, ?)",
    "addFriendRequest" : "insert ignore into `Friend Requests` values (?, ?, ?)",
    "addCommentModerationReport" : "insert ignore into Moderation (Administrator, commentID) values ((select Username from Users where Administrator = true order by rand() limit 1), ?)",
    "addReplyModerationReport" : "insert ignore into Moderation (Administrator, replyID) values ((select Username from Users where Administrator = true order by rand() limit 1), ?)",
    "addCalendarEvent" : "insert ignore into Calendar values(?, ?, ?)",
    "addPostLike" : "insert ignore into `Post Likes` values(?, ?)",
    "addCommentLike" : "insert ignore into `Comment Likes` values(?, ?)",
    "addReplyLike" : "insert ignore into `Reply Likes` values(?, ?)",
    // Getters
    "getRandomUser" : "select Name from `Random Name Generator` where Used = false order by rand() limit 1;",
    "getUser" : "select * from Users where Username = ?",
    "getUsers" : "select Username from Users",

    "getUserTags" : "select Tags from `User Recommendations` where Username = ?",
    "getRecommendation" : "select Recommendation from `User Recommendations` where Username = ?",
    "getRandomActivity" : "select * from Activities ORDER BY Rand() LIMIT 1",
    "getTaggedActivity" : "select * from `Activity Tags` where Tags = ? ORDER BY Rand() LIMIT 1",
    "getActivityTags" : "select * from `Activity Tags` where Name = ?",

    
    //"getActivity" : "select * from Activities where Name = ?",
    "getAvailableActivities" : "select ID, Name, Contents, `Main Image` as Picture from Activities",
    "getActivityComments" : "select Username, Comment from interactions where Activity = ?",
    "getRestActivityContents" : "select `Main Video`, coalesce(images, json_array()) as Images, coalesce(videos, json_array()) as Videos from (select ID, `Main Video` from Activities where ID = ?) as act left join (select activityID, json_arrayagg(json_object('Picture', picture, 'Step', Step, 'Step Description', `Step Description`)) as images from `Activity Pictures` group by activityID) as image_list on act.ID = image_list.activityID left join (select activityID, json_arrayagg(json_object('Video', video, 'Step', Step, 'Step Description', `Step Description`)) as videos from `Activity Videos` group by activityID) as video_list on act.ID = video_list.activityID",
    //"getActivityMainVideo" : "select `Main Video` from Activities where ID = ?",
    //"getActivityPictures" : "select picture as Picture, Step, `Step Description` from `Activity Pictures` where activityID = ?",
    //"getActivityVideos" : "select video, Step, `Step Description` from `Activity Videos` where activityID = ?",
    //"getActivityContents" : "select Name, Contents, `Main Image`, `Main Video`, ID, coalesce(images, json_array()) as Images, coalesce(videos, json_array()) as Videos from (select Name, Contents, `Main Image`, `Main Video`, ID from Activities where Administrator = ?) as admin_list left join (select activityID, json_arrayagg(json_object('Picture', picture, 'Step', Step, 'Step Description', `Step Description`)) as images from `Activity Pictures` group by activityID) as image_list on admin_list.ID = image_list.activityID left join (select activityID, json_arrayagg(json_object('Video', video, 'Step', Step, 'Step Description', `Step Description`)) as videos from `Activity Videos` group by activityID) as video_list on admin_list.ID = video_list.activityID",
    "getActivityContents" : "select Name, Contents, `Main Image`, `Main Video`, coalesce(images, json_array()) as Images, coalesce(videos, json_array()) as Videos from (select Name, Contents, `Main Image`, `Main Video`, ID from Activities where ID = ?) as admin_list left join (select activityID, json_arrayagg(json_object('Picture', picture, 'Step', Step, 'Step Description', `Step Description`)) as images from `Activity Pictures` group by activityID) as image_list on admin_list.ID = image_list.activityID left join (select activityID, json_arrayagg(json_object('Video', video, 'Step', Step, 'Step Description', `Step Description`)) as videos from `Activity Videos` group by activityID) as video_list on admin_list.ID = video_list.activityID",
    "getPostContents" : "select `Post Content`, `Post Image`, postID from Posts where Administrator = ?",
    "getPosts" : "select Posts.*, Picture, count(adminPost) as `Post Likes`, if(userPostLike, 1, 0) as `User Liked` from Posts join (select Username, Picture from Users where Administrator = 1) as admin_pictures on Administrator = Username left join (select `User` as adminPost, postID as postLikeID from `Post Likes`) as postLikes on postLikeID = postID left join (select postID as userPostLike from `Post Likes` where `User` = ?) as userLikes on userPostLike = postID group by postID, Picture",
    "getPostComments" : "select Comments.*, Picture, count(commentUser) as `Comment Likes`, if(userCommentID, 1, 0) as `User Liked`, `Admin` from Comments join (select Username, Picture, Administrator as `Admin` from Users) as user_pictures on `User` = Username and postID = ? left join (select `User` as commentUser, commentID as commentLikeID from `Comment Likes`) as commentLikes on commentLikeID = commentID left join (select commentID as userCommentID from `Comment Likes` where `User` = ?) as userLikes on userCommentID = commentID group by commentID, Picture, `Admin` order by Posted",
    "getCommentReplies" : "select Replies.*, Picture, count(replyUser) as `Reply Likes`, if(userReplyID, 1, 0) as `User Liked`, `Admin` from Replies join (select Username, Picture, Administrator as `Admin` from Users) as user_pictures on `User` = Username and commentID = ? left join (select `User` as replyUser, replyID as replyLikeID from `Reply Likes`) as replyLikes on replyLikeID = replyID left join (select replyID as userReplyID from `Reply Likes` where `User` = ?) as userLikes on userReplyID = replyID group by replyID, Picture, `Admin` order by Posted",
    //"getPostsandComments": "select Name, `Post Content` as content, `Post Likes` as likes, `Post Image`, Avatar, coalesce(Comments, json_array()) as Comments, json_length(coalesce(Comments, json_array())) as `Comment Counter` from Posts left join (select Post, json_arrayagg(json_object(\"id\", commentID, \"User\", User, \"avatar\", Avatar, \"content\", `Comment Content`, \"Posted\", Posted, \"likes\", `Comment Likes`, \"replies\", coalesce(replyList, json_array()))) as Comments from (select Comments.*, replyList, Picture as avatar from Comments left join (select commentID, json_arrayagg(json_object(\"User\", User, \"avatar\", `Avatar`, \"content\", `Reply Content`, \"Posted\", Posted)) as replyList from (select Replies.*, Picture as Avatar from Replies join Users where User = Username) as reply_pictures group by commentID) as ReplyList on ReplyList.commentID = Comments.commentID join Users where User = Username) as comment_pictures group by Post) as full_comments on Name = Post",
    "getTrail" : "select `Origin Latitude`, `Origin Longitude`, `Destination Latitude`, `Destination Longitude`, Latitude, Longitude from `Hiking Trail` join Waypoints where Name = ?",
    "getTrails" : "select * from `Hiking Trail`",
    "getWaypoint" : "select * from Waypoints where Route = ?",
    "getWaypoints" : "select * from Waypoints order by Order",
    "getFriends" : "select Friend, `Last Message`, DATE_FORMAT(`Creation Date`, '%a, %b %D at %l:%i %p') as `Creation Date`, `New Messages`, Picture from Friends join (select Username, Picture from Users) as friendPictures where Friend = Username and User = ?",
    "getUserChats" : "select Chat from Friends where User = ?",
    "getFriendRequests" : "select Sender, Message, `Sender Avatar` from `Friend Requests` join (select Username, Picture as `Sender Avatar` from Users) as sender_pictures on Username = Sender where Receiver = ?",
    //"getCommentModerationReports" : "select User, `Comment Content`, Posted, Reason from Comments join (select commentID, Reason from Moderation where Administrator = ?) as commentReports on Comments.commentID = commentReports.commentID",
    //"getReplyModerationReports" : "select User, `Reply Content`, Posted, Reason from Replies join (select replyID, Reason from Moderation where Administrator = ?) as replyReports on Replies.replyID = replyReports.replyID",
    "getModerationReports" : "select `comment user`, `Comment Content`, `reply user`, `Reply Content`, Reason from (select commentID, replyID, Reason from Moderation where Administrator = ?) as admin_reports left join (select User as `comment user`, `Comment Content`, Posted as `comment posted`, commentID from Comments) as comments on admin_reports.commentID = comments.commentID left join (select User as `reply user`, `Reply Content`, Posted as `reply posted`, replyID from Replies) as replies on admin_reports.replyID = replies.replyID",
    "getAdminActivities" : "select ID, Name from Activities where Administrator = ?",
    "login" : "select Username, Password, Picture, Administrator from Users where Username = ? or Email = ?",
    "adminLogin" : "select Username, Password, Picture from Users where (Username = ? or Email = ?) and Administrator = 1",
    "fpemail" : "select exists(select Email from Users where Email = ?) as existing",
    //"adminActivityCreated" : "select Name from Activities where Administrator = ?",
    //"adminPostCreated" : "select `Post Content`, `Post Image` from Posts where Administrator = ?",
    "getCalendarEvents" : "select Name, DATE_FORMAT(Date, '%l:%i %p') as `time`, DATE_FORMAT(Date, '%Y-%m-%e') as `date` from Calendar where month(Date) = ? and User = ?",
    //"getPostLikes" : "select if(userPostID, 1, 0) as liked from (select postID from Posts) as posts left join (select postID as userPostID from `Post Likes` where User = ?) as userLikes on postID = userPostID",
    //"getCommentLikes" : "select if(userCommentID, 1, 0) as liked from (select commentID from Comments where postID = ?) as postComments left join (select commentID as userCommentID from `Comment Likes` where User = ?) as userLikes on commentID = userCommentID",
    //"getReplyLikes" : "select if(userReplyID, 1, 0) as liked from (select replyID from Replies where commentID = ?) as commentReplies left join (select replyID as userReplyID from `Reply Likes` where User = ?) as userLikes on replyID = userReplyID",
    
    // Updating
    "updateRanUsed" : "update `Random Name Generator` set Used = true where Name = ?",
    "updatePwd" : "update users set Password = ? where Email = ?",
    "updateActivity" : "update activities set Name = ?, Contents = ?, `Main Image` = ?, `Main Video` = ? where ID = ?",
    "updateActivityImages" : "",
    "updateActivityVideos" : "",
    "updateActivityCounter" : "update activities set `Rating Counter` = `Rating Counter` + 1 where Name = ?",
    "updateRating" : "update activities set Rating = where Name = ?",
    "updateRecommend" : "update activities set `Number Recommended` = `Number Recommended` + 1 where Name = ?",
    "updateIncreasePostLikeCounter" : "update posts set `Post Likes` = `Post Likes` + 1 where postID = ?",
    "updateDecreasePostLikeCounter" : "update posts set `Post Likes` = `Post Likes` - 1 where postID = ?",
    //"updateIncreasePostCommentCounter" : "update posts set Comments = Comments + 1 where postID = ?",
    //"updateDecreasePostCommentCounter" : "update posts set Comments = Comments - 1 where postID = ?",
    "updateIncreaseCommentLikeCounter" : "update comments set `Comment Likes` = `Comment Likes` - 1 where commentID = ?",
    "updateDecreaseCommentLikeCounter" : "update comments set `Comment Likes` = `Comment Likes` - 1 where commentID = ?",
    "updateIncreaseReplyLikeCounter" : "update replies set `Reply Likes` = `Reply Likes` - 1 where replyID = ?",
    "updateDecreaseReplyLikeCounter" : "update replies set `Reply Likes` = `Reply Likes` - 1 where replyID = ?",
    "updateFriendChat": "update Friends set `New Messages` = ?, `Last Message` = ?, `Creation Date` = ? where User = ? and Friend = ?",
    "updateFriendOMChat" : "update Friends set `New Messages` = `New Messages` + 1, `Last Message` = ?, `Creation Date` = ? where User = ? and Friend = ?",
    "updateNM" : "update Friends set `New Messages` = 0 where User = ? and Friend = ?",
    "updateCalendarEvent" : "update Calendar set Name = ?, Date = ? where `User` = ? and Name = ? and Date = ?",

    "updateActivityTag" : "update `Activity Tags` set Tags = ? where Activity = ?",
    "updateUserTag" : "update `User Recommendations` set Tags = ? where Username = ?",
    "updateUserRecommendation" : "update `User Recommendations` set Recommendation = ? where Username = ?",
    // Deleting
    "deleteUser" : "delete from Users where Username = ?",
    "deleteActivity" : "delete from Activities where ID = ?",
    "deleteHiking" : "delete from `Hiking Trail` where Name = ?",
    "deleteWaypoint" : "delete from Waypoints where Route = ?",
    "deletePost" : "delete from Posts where postID = ?",
    "deleteComment" : "delete from Comments where commentID = ?",
    "deleteReply" : "delete from Replies where replyID = ?",
    "deleteActivityTag" : "delete from `Activity Tags` where Activity = ?",
    "deleteUserTag" : "delete from `User Recommendations` where Username = ?",
    "deleteFriendRequest" : "delete from `Friend Requests` where Sender = ? and Receiver = ?",
    "deleteCommentModerationReport" : "delete from Moderation where commentID = ?",
    "deleteReplyModerationReport" : "delete from Moderation where replyID = ?",
    "deletePostLike" : "delete from `Post Likes` where `User` = ? and postID = ?",
    "deleteCommentLike" : "delete from `Comment Likes` where `User` = ? and commentID = ?",
    "deleteReplyLike" : "delete from `Reply Likes` where `User` = ? and replyID = ?",
    "deleteCalendarEvent" : "delete from Calendar where `Name` = ? and `User` = ? and `Date` = ?",
    // Conditions
    "userExists" : "select exists (select * from Users where Username = ?) as userExists",
    "emailExists" : "select exists (select Email from Users where Email = ?) as emailExists",
    //"postLikeExists" : "select exists (select * from `Post Likes` where User = ? and postID = ?) as postLikeExists",
    //"commentLikeExists" : "select exists (select * from `Comment Likes` where User = ? and commentID = ?) as commentLikeExists",
    //"replyLikeExists" : "select exists (select * from `Reply Likes` where User = ? and replyID = ?) as replyLikeExists",
}

const register = 0
const insertsql = 1
const updatesql = 2
const deletesql = 3

// otp as key and all data in array as value
const pendingRegisterData = {}

var verifyTimers = {}

/**
 * Executes all the select queries.
 * 
 * Description.
 * 
 * @param {*} res 
 * @param {string} sql 
 * @param {string | Array | undefined} values 
 */
function execSQLQuery(res, sql, values, hasPicture=false, pcr="") {
    connectionString.getConnection((err, conn) => {
        res.append('Access-Control-Allow-Origin', '*')
        if (err) {
            console.error("err after connecting db")
            return res.status(500).json(err)
        }
        conn.query(sql, values, (err, result) => {
            conn.release()
            if (err) {
                console.error("err after query")
                return res.status(500).json(err)
            }
            if (hasPicture && pcr == "") {
                console.log("Got in if statment")
                const files = result.map((r) => {
                    return r["Picture"] != null ? readFile(`./${r["Picture"]}`, {encoding: 'base64'}) : null
                })
                return Promise.all(files).then((filenames) => {
                    for (let i = 0; i < result.length; i++)
                        result[i]["Picture"] = result[i]["Picture"] != null ? `data:image/jpeg;base64,${filenames[i]}` : null
                    console.log("Successful Query")
                    console.log("result from ESQ:", result)
                    return res.status(200).json(result)
                })
            }
            else if (hasPicture && pcr != "") {
                console.log("Got in else if statment")
                const files = result.map((r) => {
                    return [r["Picture"] != null ? readFile(`./${r["Picture"]}`, {encoding: 'base64'}) : null, r[pcr] != null ? readFile(`./${r[pcr]}`, {encoding: 'base64'}) : null]
                })      
                return Promise.all(
                    files.map((filenames) => {
                        return Promise.all(filenames)
                    })
                ).then(finished => {
                    for (let i = 0; i < result.length; i++) {
                        result[i]["Picture"] = result[i]["Picture"] != null ? `data:image/jpeg;base64,${finished[i][0]}` : null
                        result[i][pcr] = result[i][pcr] != null ? `data:image/jpeg;base64,${finished[i][1]}` : null
                    }
                    console.log("Successful Query")
                    console.log("result from ESQ:", result)    
                    return res.status(200).json(result)
                })
            }
            else {
                console.log("Got in else statment")
                console.log("Successful Query")
                console.log("result from ESQ:", result)
                return res.status(200).json(result)
            }
        })
    })
}

/**
 * Executes all the non-select queries.
 * 
 * Description.
 * 
 * @param {*} res 
 * @param {string} sql 
 * @param {string | Array | undefined} values 
 * @param {number} functype
 * @param {Object} insertPicture 
 * @param {boolean} admin
 */
function execSQLNonQuery(res, sql, values, funcType, insertPicture={}, admin=false) {
    connectionString.getConnection((err, conn) => {
        res.append('Access-Control-Allow-Origin', '*')
        if (err) {
            console.error("err after connection:", err)
            return res.status(500).json(err)
        }
        conn.query(sql, values, (err, result) => {
            conn.release()
            if (err) {
                console.error("err after query:", err)
                return res.status(500).json(err)
            }
            console.log("Successful Non-query")
            switch (funcType) {
                // Register
                case register:
                    if (Object.keys(insertPicture).length) {
                        writeFileSync(`./${insertPicture.filePath}`, insertPicture.buffer)
                        console.log("Picture file written from register")
                    }
                    console.log("Successful Register Query")
                    return admin ? res.redirect("/admin") : res.status(201).json({ message: "User has been created.", name: values[0]})        
                // Insert
                case insertsql:
                    if (Object.keys(insertPicture).length) {
                        writeFileSync(`./${insertPicture.filePath}`, insertPicture.buffer)
                        console.log("Picture file written from insert")
                    }
                    console.log("Successful Insert Query")
                    return res.status(201).json("Row added")
                // Update
                case updatesql:
                    console.log("Successful Update Query")
                    return res.status(200).json(result.affectedRows + " rows updated")
                // Delete   
                default:
                    console.log("Successful Delete Query")
                    return res.status(200).json(result.affectedRows + " rows deleted")
            }
        })
    })
}

/**
 * Checks if the generated username is already in the database
 * 
 * Description.
 * 
 * @param {*} userDB 
 * @param {*} newName 
 * @returns 
 */
function nameIndb(userDB, newName) {
    let left = 0
    let right = userDB.length - 1
    let mid
    while (left <= right) {
        mid = (left + right) >> 1
        if (newName.localeCompare(userDB[mid]["Username"]) > 0)
            left = mid + 1
        else if (newName.localeCompare(userDB[mid]["Username"]) < 0)
            right = mid - 1
        else
            return true
    }
    return false
}

function privateLogin(res, loginID, pwd, admin) {
    connectionString.getConnection((err, conn) => {
        res.append('Access-Control-Allow-Origin', '*')
        if (err) return res.status(500).json(err)
        conn.query(queries[admin ? "adminLogin" : "login"], [loginID, loginID], (err, result) => {
            conn.release()
            if (err) return res.status(500).json(err)
            
            if (result.length === 0) return res.status(401).json("Incorrect Username or Email")
            
            if (!dbSecurity.validatePW(result[0]["Password"], pwd)) {
                console.log("Incorrect Password")
                return res.status(401).json("Incorrect Password")
            }

            let fileContent = result[0]["Picture"] != null ? readFileSync(`./${result[0]["Picture"]}`, 'base64') : ""
            let imgBin = `data:image/jpeg;base64,${fileContent}`
            
            const token = dbSecurity.generateToken(result[0]["Username"])
            console.log("token generated")
            res.status(200).cookie("access_token", token, {
                httpOnly: true
            })
            
            if (admin) {
                console.log("Got into admin login")
                mcache.put(result[0]["Username"], imgBin)
                console.log("Redirecting")
                return res.redirect('/adminSJAdd')
            }
            else {
                console.log("Got into regular login")
                return res.json({ loggedInUser: result[0]["Username"], loggedInAvatar: imgBin, loggedInIsAdmin: result[0]["Administrator"]})
            } 
        })
    })
}

async function getAvatar(username, admin=false) {
    try {
        const apiToken = readFileSync('./cred/https/avatar.pem', 'utf8')
        //console.log("apiToken:", apiToken)
        const response = await fetch(
            "https://api-inference.huggingface.co/models/prompthero/openjourney",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${apiToken}`,
                    "x-wait-for-model": "true"
                },
                body: JSON.stringify({ inputs: username }),
            }
        )
        const genImage = await response.blob()
        const abuffer = await genImage.arrayBuffer()
        return {
            filePath: `Avatars/${admin ? "Administrators" : "Users"}/${username.replace(/ /g, '_')}.jpeg`, 
            buffer: Buffer.from(abuffer)
        }
    }
    catch (err) {
        console.error("err:", err)
    }
}

function adminDBFill(admin, base, res) {
    connectionString.getConnection((err, conn) => {
        res.append('Access-Control-Allow-Origin', '*')
        if (err) return res.status(500).json(err)
        let query
        let isReport
        //console.log("base url:", base)
        switch (base) {
            case "adminSJEdit":
            case "adminSJDelete":
                query = `${queries["getPostContents"]}; ${queries["getAdminActivities"]}`
                isReport = false
                break
            case "adminSJReport":
                query = queries["getModerationReports"]
                isReport = true
                break
        }    
        conn.query(query, isReport ? admin : [admin, admin], (err, result) => {
            conn.release()
            if (err) return res.status(500).json(err)
            //console.log("result:", result)
            switch (base) {
                case "adminSJEdit":
                case "adminSJDelete":
                    const [Rposts, Ractivities] = result
                    // Read image files for both posts and activities
                    Rposts.forEach((r) => {
                        if (r['Post Image'] != null)
                            r['Post Image'] = {
                                filename: r['Post Image'].substring(r['Post Image'].lastIndexOf("/") + 1),
                                buffer: `data:image/jpeg;base64,${readFileSync(r['Post Image'], 'base64')}`   
                            }
                    })
                    //console.log('Ractivities:', Ractivities)
                    //console.log('Rposts:', Rposts)
                    res.locals.activities = Ractivities
                    res.locals.posts = Rposts 
                    break
                case "adminSJReport":
                    res.locals.moderations = result
                    break
            }
            return res.render(base)
        })
    })
}

export default class SolaceSQL {

    /********************************** Login Mehtods **********************************/
    
    /**
     * Attempts to create a new user.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static register(req, res) {
        let insertingData = Object.keys(req.query).length ? req.query : req.body
        let { admin, email, pwd } = insertingData
        if (!dbSecurity.emailFormat(email)) {
            console.log("Invalid Email Format")
            res.append('Access-Control-Allow-Origin', '*')
            return res.status(401).json("Invalid Email Format")
        }
        else
            connectionString.getConnection((err, conn) => {
                res.append('Access-Control-Allow-Origin', '*')
                if (err) return res.status(500).json(err)
                conn.query(`${queries["emailExists"]}; ${queries["getRandomUser"]};`, email, (err, result) => {
                    conn.release()
                    //console.log("result:", result)
                    
                    if (err) return res.status(500).json(err)
                    const [[{emailExists}], [{Name}]] = result
                    if (emailExists) return res.status(403).json("Email is already in use")
                    let hashed = dbSecurity.hashPW(pwd)
                    let values = admin ? [Name, hashed, email, admin] : [Name, hashed, email]
                
                    const generatedOTP = dbSecurity.generateOTP()
                    console.log("OTP generated")
                    console.log(generatedOTP)
                    pendingRegisterData[req.ip] = {
                        otp: generatedOTP, 
                        value: values,
                        isSignup: true
                    }
                    //dbSecurity.sendEmail(email, generatedOTP)
                    verifyTimers[req.ip] = setTimeout((ip) => {console.log("deleting:", pendingRegisterData[ip]); delete pendingRegisterData[ip];}, 300000, req.ip)
                    console.log("Email Sent")
                    return admin ? res.redirect("/adminEmailVerification") : res.status(200).json("Begin Email Verification")
                })
            })
    }
    
    static ifEmailExists(req, res) {
        let {email} = req.query
        if (!dbSecurity.emailFormat(email)) {
            console.log("Invalid Email Format")
            res.append('Access-Control-Allow-Origin', '*')
            return res.status(401).json("Invalid Email Format")
        }
        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) return res.status(500).json(err)
            conn.query(queries["fpemail"], email, (err, result) => {
                if (err) {
                    conn.release()
                    return res.status(500).json(err)
                }
                if (!result[0]["existing"]) {
                    return res.status(404).json("You don't have an account.")
                }
                const generatedOTP = dbSecurity.generateOTP()
                console.log("OTP generated")
                pendingRegisterData[req.ip] = {
                    otp: generatedOTP, 
                    email: email,
                    isSignup: false
                }
                //dbSecurity.sendEmail(email, generatedOTP)
                verifyTimers[req.ip] = setTimeout((ip) => {console.log("deleting:", pendingRegisterData[ip]); delete pendingRegisterData[ip];}, 300000, req.ip)
                console.log(generatedOTP)
                console.log("Email Sent")
                return res.status(200).json("Begin Email Verification")
            })
        })
    }

    /**
     * Logs in the user with username or email.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static login(req, res) {
        const {loginID, pwd, admin} = req.query
        privateLogin(res, loginID, pwd, admin)
    }

    

    /**
     * Checks if the otp generated equals the user inputted otp
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res
     */
    static async verify(req, res) {
        // Check OTP from email with one generated
        let ipAddress = req.ip
        clearTimeout(verifyTimers[ipAddress])
        delete verifyTimers[ipAddress]
        if (pendingRegisterData[ipAddress] === undefined) {
            console.log("Email verification failed")
            res.append('Access-Control-Allow-Origin', '*')
            return res.status(401).json("Email verification failed.")
        }
        let savedotp = pendingRegisterData[ipAddress]["otp"]
        let isSignUp = pendingRegisterData[ipAddress]["isSignup"]
        // TODO: check req.body for admin otp input
        if (savedotp === req.query.otp) {
            console.log("OTP confirmed")
            if (isSignUp) {
                let pendingValues = pendingRegisterData[ipAddress]["value"]
                delete pendingRegisterData[ipAddress]
                const ispvlength4 = pendingValues.length == 4
                //let avatar = pendingRegisterData[ipAddress]["avatar"]
                let avatar = await getAvatar(pendingValues[0], ispvlength4)
                pendingValues.push(avatar.filePath)
                pendingValues.push(pendingValues[0]) 
                execSQLNonQuery(res, `${queries[ispvlength4 ? "addAdmin" : "addUser"]}; ${queries["updateRanUsed"]}`, pendingValues, register, avatar, ispvlength4)
            }
            else {
                let email = pendingRegisterData[ipAddress]["email"]
                delete pendingRegisterData[ipAddress]
                console.log('FP verified')
                res.append('Access-Control-Allow-Origin', '*')
                return res.status(200).json(email)    
            }
        }
        else {
            console.log("Email verification failed")
            res.append('Access-Control-Allow-Origin', '*')
            return res.status(401).json("Email verification failed.")
        }
    }

    /**
     * Logs out the user.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static logout(req, res) {
        // Clear cookies
        const {admin} = req.query
        res.clearCookie('access_token')
        return admin ? res.redirect("/admin") : res.status(200).json("Cookie Cleared")
    }

    /****************************** Add Methods ****************************************/

    /**
     * Add new activity to the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addActivity(req, res) {
        console.log("Inside add activity")
        const {name, contents, mainVideo, admin} = req.query
        let mainFilePath = `ActivityPictures/MainImages/${req.files.mainImage[0].originalname}`
        let listValues = " values "
        const listArray = []
        let isImages
        if (req.files.images !== undefined) {
            isImages = true
            const images = req.files.images
            const imageSteps = req.body.imageSteps
            for (let i = 0; i < images.length; i++) {
                let filePath = `ActivityPictures/ImageSteps/${images[i].originalname}`
                listValues += "(?, ?, ?, ?), "
                listArray.push({
                    file: filePath,
                    step: imageSteps[i],
                    buffer: images[i].buffer
                })
            }
        }
            
        if (req.body.videos !== undefined) {
            isImages = false
            const videos = req.body.videos
            const videoSteps = req.body.videoSteps
            for (let i = 0; i < videos.length; i++) {
                listValues += "(?, ?, ?, ?), "
                listArray.push({
                    video: videos[i],
                    step: videoSteps[i]
                })
            }
        }
        
        listValues = listValues.substring(0, listValues.length - 2) + ';'
        /*
        listArray.forEach(e => {
            console.log("e:", e)
        })
        */
                
        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) {
                console.log("error before query:", err)
                return res.status(500).json(err)
            }
            conn.query(queries["addActivity"], [name, contents, mainFilePath, mainVideo, admin], (err, result) => {
                if (err) {
                    console.log("error after query:", err)
                    return res.status(500).json(err)
                }
                writeFileSync(`./${mainFilePath}`, req.files.mainImage[0].buffer)
                console.log("main file written")
                if (listArray.length) {
                    const ID = result.insertId
                    let parameters = []
                    // TODO: Put image step list into their own directory
                    /*
                    let imageStepDir
                    if (isImages) {
                        imageStepDir = `./ActivityPictures/ImageSteps/activity_${ID}`
                        mkdirSync(imageStepDir)
                        listArray.forEach((element, index) => {
                            parameters = [...parameters, ID, element.file, index + 1, element.step]
                            writeFileSync(`${imageStepDir}/${element.file}`, element.buffer)
                        })
                    }
                    else {
                        listArray.forEach((element, index) => {
                            parameters = [...parameters, ID, element.video, index + 1, element.step]
                        })
                    }
                    */
                    listArray.forEach((element, index) => {
                        parameters = [...parameters, ID, isImages ? element.file : element.video, index + 1, element.step]
                    })
                    const fullQuery = queries[isImages ? "addActivityPictures" : "addActivityVideos"] + listValues
                    conn.query(fullQuery, parameters, (err, result) => {
                        conn.release()
                        if (err) {
                            //console.log("error after query:", err)
                            return res.status(500).json(err)
                        }
                        
                        if (isImages)
                            listArray.forEach((element) => {
                                writeFileSync(`./${element.file}`, element.buffer)
                                console.log("Image step file written")
                            })
                        
                        console.log("Successful Non-query activity step list")
                        //console.log("result after step list query:", result)
                        return res.status(201).json("Added new activity with steps")
                    })
                }
                else {
                    conn.release()
                    console.log("Successful Non-query")
                    return res.status(201).json("Added new activity without steps")
                }
            })
        })
    }

    /**
     * Add new friend to the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addFriend(req, res) {
        const now = new Date().toJSON().slice(0, 19).replace('T', ' ')
        console.log("now:", now)
        const {user, friend} = req.query
        const userUn = user.replace(/ /g, "_")
        const friendUn = friend.replace(/ /g, "_")
        let userChatFile = `${userUn}-${friendUn}.json`
        let friendChatFile = `${friendUn}-${userUn}.json`
        writeFileSync(`./Chats/${userChatFile}`, '[]')
        writeFileSync(`./Chats/${friendChatFile}`, '[]')
        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) {
                console.log("error before query:", err)
                return res.status(500).json(err)
            }
            conn.query(`${queries["addFriend"]}; ${queries["deleteFriendRequest"]};`, [user, friend, now, userChatFile, friend, user, now, friendChatFile, user, friend], (err, result) => {
                conn.release()
                if (err) {
                    console.log("error after query:", err)
                    return res.status(500).json(err)
                }
                console.log("Successful Non-query")
                return res.status(201).json("Added Friend and Deleted Friend Request")
            })
        })
    }

    /**
     * Add new trail to the database
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addHiking(req, res) {
        const {name, ola, olo, dla, dlo} = req.query
        execSQLNonQuery(res, queries["addHiking"], [name, ola, olo, dla, dlo], insertsql)
    }

    /**
     * Saves comment of a post in the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addComment(req, res) {
        const {user, content, posted, postID} = req.query
        execSQLNonQuery(res, queries["addComment"], [user, content, posted, postID], insertsql)
    }

    /**
     * Adds a new post to the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addPost(req, res) {
        const {admin, content} = req.query
        console.log("Inside add post")
        console.log("req.files:", req.files)
        const image = req.files !== undefined ? req.files.postImage[0] : "" 
        console.log("admin:", admin, ", content:", content, ", image:", image)
        image !== "" ? execSQLNonQuery(res, queries["addPostWithPicture"], [admin, content, `PostImages/${image.originalname}`], insertsql, { filePath: `PostImages/${image.originalname}`, buffer: image.buffer}) : execSQLNonQuery(res, queries["addPost"], [admin, content], insertsql)
    }

    /**
     * Saves reply of a comment in the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addReply(req, res) {
        const {user, content, posted, commentID} = req.query
        execSQLNonQuery(res, queries["addReply"], [user, content, posted, commentID], insertsql)
    }

    /**
     * Adds a new waypoint to the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addWaypoint(req, res) {
        const {route, latitude, longitude, order} = req.query
        execSQLNonQuery(res, queries["addWaypoint"], [route, latitude, longitude, order], insertsql)
    }

    /**
     * Add new tagged activity to the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addActivityTag(req, res) {
        const {name, tag} = req.query
        execSQLNonQuery(res, queries["addActivityTag"], [name, tag], insertsql)
    }

    /**
     * Add new tagged user to the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addUserTagNoRec(req, res) {
        const {username, tag} = req.query
        execSQLNonQuery(res, queries["addUserTagNoRec"], [username, tag], insertsql)
    }

    /**
     * Add new tagged user to the database with an activity recommendation.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addUserTagRec(req, res) {
        const {username, tag, recommendation} = req.query
        execSQLNonQuery(res, queries["addUserTagRec"], [username, tag, recommendation], insertsql)
    }

    /**
     * Add a new friend request
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addFriendRequest(req, res) {
        const {sender, receiver, msg} = req.query
        execSQLNonQuery(res, queries["addFriendRequest"], [sender, receiver, msg], insertsql)
    }

    /**
     * Adds moderator report to a random administrator
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addModerationReport(req, res) {
        const {commentID, replyID} = req.query
        execSQLNonQuery(res, queries[commentID ? "addCommentModerationReport" : "addReplyModerationReport"], commentID ? commentID : replyID, insertsql)
    }

    /**
     * Adds new user calendar event
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static addCalendarEvent(req, res) {
        const {name, user, date} = req.query
        execSQLNonQuery(res, queries["addCalendarEvent"], [name, user, date], insertsql)
    }

    /******************************************************************************/
    /*                                                                            */
    /*                                 Getters                                    */
    /*                                                                            */
    /******************************************************************************/


    /**
     * Gets all users from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getUsers(req, res) {
        execSQLQuery(res, queries["getUsers"], undefined)
    }

    /**
     * Gets all posts stored in the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getPosts(req, res) {
        execSQLQuery(res, queries["getPosts"], req.query.user, true, "Post Image")
    }

    /**
     * Gets all the comments associated with the provided post
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getPostComments(req, res) {
        const {postID, user} = req.query
        execSQLQuery(res, queries["getPostComments"], [postID, user], true, "Comment Image")
    }

    /**
     * Gets all the replies associated with the provided comment from database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getCommentReplies(req, res) {
        const {commentID, user} = req.query
        execSQLQuery(res, queries["getCommentReplies"], [commentID, user], true, "Reply Image")
    }

    /**
     * Gets specified activity contents from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getActivity(req, res) {
        const {activityID} = req.query
        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) {
                //console.log("error before query:", err)
                return res.status(500).json(err)
            }
            conn.query(queries["getRestActivityContents"], activityID, (err, result) => {
                if (err) {
                    //console.log("error after query:", err)
                    return res.status(500).json(err)
                }
                // console.log("result:", result)
                if (result[0]["Images"].length) {
                    const files = result[0]["Images"].map((r) => {
                        return r["Picture"] != null ? readFile(`./${r["Picture"]}`, {encoding: 'base64'}) : null
                    })
                    return Promise.all(files).then((filenames) => {
                        for (let i = 0; i < result[0]["Images"].length; i++)
                            result[0]["Images"][i]["Picture"] = `data:image/jpeg;base64,${filenames[i]}`
                        console.log("Successful Query")
                        return res.status(200).json(result)
                    })
                }
                else {
                    console.log("Successful Query")
                    return res.status(200).json(result)
                }
            })
        })
    }

    /**
     * Gets a user's tags from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getUserTags(req, res) {
        execSQLQuery(res, queries["getUserTags"], req.query.username)
    }

    /**
     * Gets a user recommendation from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getRecommendation(req, res) {
        execSQLQuery(res, queries["getRecommendation"], req.query.username)
    }

     /**
     * Gets specified activities from the database using tags.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
     static getTaggedActivity(req, res) {
        execSQLQuery(res, queries["getTaggedActivity"], req.query.tag)
    }

    /**
     * Gets specified activity's tag from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getActivityTags(req, res) {
        execSQLQuery(res, queries["getActivityTags"], req.query.name)
    }
    
    /**
     * Gets a randomized activity in the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getRandomActivity(req, res) {
        execSQLQuery(res, queries["getRandomActivity"], undefined)
    }

    /**
     * Gets all activities in the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getAvailableActivities(req, res) {
        execSQLQuery(res, queries["getAvailableActivities"], undefined, true)
    }

    // Implement for demo

    /**
     * Gets all the comments associated with the provided activity.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getActivityComments(req, res) {
        execSQLQuery(res, queries["getActivityComments"], req.query.activity)
    }

    /**
     * Gets all the friends associated with the provided user.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getFriends(req, res) {
        execSQLQuery(res, queries["getFriends"], req.query.username, true)
    }

    /**
     * Gets all chat history from user
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getUserChats(req, res) {
        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) return res.status(500).json(err)
            conn.query(queries["getUserChats"], req.query.user, (err, result) => {
                conn.release()
                if (err) return res.status(500).json(err)
                const fileArr = result.map((chat) => {
                    let fileContent = readFileSync(`./Chats/${chat["Chat"]}`, 'utf8')
                    return {
                        filename: chat["Chat"],
                        filedata: fileContent
                    }
                })
                return res.status(200).json(fileArr)
            })
        })
    }

    /**
     * Gets specified trail from the database.
     * 
     * Description.
     * 
     * @param {*} res 
     * @param {*} req 
     */
    static getTrail(req, res) {
        execSQLQuery(res, queries["getTrail"], req.query.name)
    }

    // Implement for demo

    /**
     * Gets all the trails associated with the provided user.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getTrails(req, res) {
        execSQLQuery(res, queries["getTrails"], undefined)
    }

    /**
     * Gets a waypoint from the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getWaypoint(req, res) {
        execSQLQuery(res, queries["getWaypoint"], req.query.route)
    }

    /**
     * Gets all waypoint data in the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getWaypoints(req, res) {
        execSQLQuery(res, queries["getWaypoints"], undefined)
    }

    /**
     * Gets friend requests of receiver
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getFriendRequests(req, res) {
        execSQLQuery(res, queries["getFriendRequests"], req.query.receiver)
    }

    /**
     * Gets all moderation reports for an administrator both comments and replies
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getModerationReports(req, res) {
        const {admin} = req.query
        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) return res.status(500).json(err)
            conn.query(`${queries["getCommentModerationReports"]}; ${queries["getReplyModerationReports"]};`, [admin, admin], (err, result) => {
                conn.release()
                if (err) return res.status(500).json(err)
                console.log("moderation reports:", result)
                return res.status(200).json(result)
            })
        })
    }

    /**
     * Gets all user calendar events for the month
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static getCalendarEvents(req, res) {
        const {user, month} = req.query
        execSQLQuery(res, queries["getCalendarEvents"], [month, user])
    }

    
    /****************************************************************************************/
    /*                                                                                      */
    /*                                   Update Methods                                     */
    /*                                                                                      */
    /****************************************************************************************/


    /**
     * Updates the user's current password with the new password provided.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updatePwd(req, res) {
        execSQLNonQuery(res, queries["updatePwd"], [dbSecurity.hashPW(req.query.newPassword), req.query.email], updatesql)
    }

    /**
     * Updates the activity
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateActivity(req, res) {
        
    }

    /**
     * Updates the activity's counter.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateCounter(req, res) {
        execSQLNonQuery(res, queries["updateActivityCounter"], req.query.activity, updatesql)
    }

    /**
     * Updates the activity's star average rating.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateRating(req, res) {
        execSQLNonQuery(res, queries["updateRating"], [req.query.newRating, req.query.activity], updatesql)
    }

    /**
     * Updates the activity's recommended counter.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateRecommend(req, res) {
        execSQLNonQuery(res, queries["updateRecommend"], req.query.activity, updatesql)
    }

    /**
     * Updates the number of likes of a post
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updatePostLikes(req, res) {
        const {postID, user, increase} = req.query
        console.log("In UPL")
        console.log("postID:", postID, ", user:", user, ", increase:", increase)
        const inNum = parseInt(increase)
        execSQLNonQuery(res, queries[inNum ? "addPostLike" : "deletePostLike"], [user, postID], inNum ? insertsql : deletesql)
    }

    /**
     * Updates the number of comments of a post
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updatePostComments(req, res) {
        execSQLNonQuery(res, queries[req.query.increase ? "updateIncreasePostCommentCounter" : "updateDecreasePostCommentCounter"], req.query.postID, updatesql)
    }

    /**
     * Updates the number of likes of a comment
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateCommentLikes(req, res) {
        const {commentID, user, increase} = req.query
        console.log("In UCL")
        console.log("commentID:", commentID, ", user:", user, ", increase:", increase)
        const inNum = parseInt(increase)
        execSQLNonQuery(res, queries[inNum ? "addCommentLike" : "deleteCommentLike"], [user, commentID], inNum ? insertsql : deletesql)
    }

    /**
     * Updates the number of likes of a reply
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateReplyLikes(req, res) {
        const {replyID, user, increase} = req.query
        console.log("In URL")
        console.log("replyID:", replyID, ", user:", user, ", increase:", increase)
        const inNum = parseInt(increase)
        execSQLNonQuery(res, queries[inNum ? "addReplyLike" : "deleteReplyLike"], [user, replyID], inNum ? insertsql : deletesql)
    }

    /**
     * Updates the activity's current tag with the new one provided.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateActivityTag(req, res) {
        execSQLNonQuery(res, queries["updateActivityTag"], [req.query.tag, req.query.name], updatesql)
    }

    /**
     * Updates the user's current favorite tag with the new one provided.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateUserTag(req, res) {
        execSQLNonQuery(res, queries["updateUserTag"], [req.query.tag, req.query.username], updatesql)
    }

    /**
     * Updates the user's current recommended activity with the new one provided.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateUserRecommendation(req, res) {
        execSQLNonQuery(res, queries["updateUserRecommendation"], [req.query.recommendation, req.query.username], updatesql)
    }

    /**
     * Updates the user, friend chat file
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateChatFile(req, res) {
        const {user, friend, data, msgCounter, lastmsg} = req.query
        //console.log("user:", user, ", friend:", friend)
        //console.log("data:", data, ", lastmsg:", lastmsg, ", msgCounter:", msgCounter)
        let last = JSON.parse(lastmsg)
        const file = `./Chats/${user.replace(/ /g, '_')}-${friend.replace(/ /g, '_')}.json`
        let jsonString = readFileSync(file, 'utf8')
        //console.log("Read file")
        let chatArray = JSON.parse(jsonString)
        let newData = JSON.parse(data)
        newData.forEach((newChat) => {
            chatArray.push(newChat)
        })
        console.log("Done updating chatArray")
        writeFileSync(file, JSON.stringify(chatArray, null, 2), {encoding: 'utf8'})
        console.log("Written updated chatArray")
        execSQLNonQuery(res, queries[msgCounter != "1" ? "updateFriendChat" : "updateFriendOMChat"], msgCounter != "1" ? [msgCounter, last.content, last.createdAt, user, friend] : [last.content, last.createdAt, user, friend], updatesql)
    }

    /**
     * Resets the new message count to 0
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateNM(req, res) {
        const {user, friend} = req.query
        execSQLNonQuery(res, queries["updateNM"], [user, friend], updatesql)
    }

    /**
     * Updates the user's calendar event
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static updateCalendarEvent(req, res) {
        const {user, orgName, newName, orgDate, newDate} = req.query
        execSQLNonQuery(res, queries["updateCalendarEvent"], [newName, newDate, user, orgName, orgDate], updatesql)
    }

    /*************************************** Delete Methods *********************************/

    /**
     * Deletes the user from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteUser(req, res) {
        execSQLNonQuery(res, queries["deleteUser"], req.query.username, deletesql)
    }
    
    /**
     * Deletes the activity from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteActivity(req, res) {
        //const {activityID, filename} = req.query
        //unlinkSync(`./ActivityPictures/MainImages/${filename}`)
        execSQLNonQuery(res, queries["deleteActivity"], req.query.activityID, deletesql)
    }
    
    /**
     * Deletes the trail from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteHiking(req, res) {
        execSQLNonQuery(res, queries["deleteHiking"], req.query.trail, deletesql)
    }

    /**
     * Deletes the waypoint from the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteWaypoint(req, res) {
        execSQLNonQuery(res, queries["deleteWaypoint"], req.query.route, deletesql)
    }

    /**
     * Deletes the user from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteUserTag(req, res) {
        execSQLNonQuery(res, queries["deleteUserTag"], req.query.username, deletesql)
    }

    /**
     * Deletes the activity from the database.
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteActivityTag(req, res) {
        execSQLNonQuery(res, queries["deleteActivityTag"], req.query.activity, deletesql)
    }

    /**
     * Deletes the friend request from the database
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteFriendRequest(req, res) {
        const {sender, receiver} = req.query
        execSQLNonQuery(res, queries["deleteFriendRequest"], [sender, receiver], deletesql)
    }

    /**
     * Deletes a moderation report from administrator's list
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteModerationReport(req, res) {
        const {commentID, replyID} = req.query
        execSQLNonQuery(res, queries[commentID ? "deleteCommentModerationReport" : "deleteReplyModerationReport"], commentID ? commentID : replyID, deletesql)
    }

    /**
     * Deletes an administrator's post
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deletePost(req, res) {
        const {postID, filename} = req.query
        console.log("postID:", postID, ", filename:", filename)
        if (filename !== undefined) {
            let filePath = `./PostImages/${filename}`
            if (existsSync(filePath))
                unlinkSync(filePath)
        }
        execSQLNonQuery(res, queries["deletePost"], postID, deletesql)
    }

    /**
     * Deletes a comment
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteComment(req, res) {
        execSQLNonQuery(res, queries["deleteComment"], req.query.commentID, deletesql)
    }

    /**
     * Deletes a reply
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteReply(req, res) {
        execSQLNonQuery(res, queries["deleteReply"], req.query.replyID, deletesql)
    }

    /**
     * Deletes a user's calendar event
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static deleteCalendarEvent(req, res) {
        const {user, name, date} = req.query
        execSQLNonQuery(res, queries["deleteCalendarEvent"], [name, user, date], deletesql)
    }

    /******************************************* Recommendation Methods ****************************************/
    
    static generateRecommendActivity(req, res) {
        let { username, tag } = req.query

        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) return res.status(500).json(err)
            conn.query(queries["getTaggedActivity"], [req.query.tag], (err, result) => {
                conn.release()
                if (err) return res.status(500).json(err)
                
                if (result.length === 0) return res.status(404).json("Invalid Name")

                let recommendation = result.name
                
                execSQLNonQuery(res, queries["updateUserRecommendation"], [req.query.username, req.query.tag, recommendation], insertsql)
                console.log("Successful Recommendation")
                return res.json(`${req.query.username} is recommend to try ${recommendation}`)
            })
        })
    }

    /********************************************** Admin **************************************************/
    
    /**
     * Verifies the administrator's login credentials
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static adminLogin(req, res) {
        const {loginID, pwd, admin} = req.query
        privateLogin(res, loginID, pwd, admin)
    }

    /**
     * Makes a new user become an administrator
     * 
     * Description.
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static adminSignUp(req, res) {

    }

    /**
     * Gets different web pages from the administrator website
     * 
     * Description
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static adminNavigation(req, res) {
        if (req.cookies.access_token === undefined) {
            console.log("Redirecting after access_token error")
            return res.redirect("/admin")
        }
        // TODO: When admin logouts, delete token
        const detoken = dbSecurity.validateToken(req.cookies.access_token)
        //console.log("detoken:", detoken)
        if (detoken instanceof Error) {
            console.log("Redirecting after jwt error")
            return res.redirect("/admin")
        }
        const imgBin = mcache.get(detoken.user)
        if (imgBin == null) {
            console.log("Redirecting after imgBin error")
            return res.redirect("/admin")
        }
        res.locals.administrator = detoken.user
        res.locals.avatarPicture = imgBin
        //console.log("req.url:", req.url)
        if (req.url == "/adminSJAdd")
            return res.render('adminSJAdd')
        adminDBFill(detoken.user, req.url.substring(1), res)
    }

    static adminEditContent(req, res) {
        // TODO: put edit method from adminDBFill here
        connectionString.getConnection((err, conn) => {
            res.append('Access-Control-Allow-Origin', '*')
            if (err) return res.status(500).json(err)
            conn.query(queries["getActivityContents"], req.query.id, (err, result) => {
                if (err) return res.status(500).json(err)
                //console.log("result:", result)
                result[0]["Main Image"] = {
                    filename: result[0]["Main Image"].substring(result[0]["Main Image"].lastIndexOf("/") + 1),
                    buffer: `data:image/jpeg;base64,${readFileSync("./" + result[0]['Main Image'], 'base64')}`
                }
                if (result[0]["Images"].length) {
                    result[0]["Images"].forEach((rr) => {
                        rr['Picture'] = {
                            filename: rr['Picture'].substring(rr['Picture'].lastIndexOf("/") + 1),
                            buffer: `data:image/jpeg;base64,${readFileSync("./" + rr['Picture'], 'base64')}`
                        }
                    })
                }
                return res.status(200).json(result[0])
            })
        })
    }

    /******************************************* Statistics Methods ****************************************/
}

