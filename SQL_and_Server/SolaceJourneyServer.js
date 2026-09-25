import express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import SolaceSQL from './SolaceSQL.js'
import https from 'https'
import { readFileSync } from 'fs'
import bodyParser from 'body-parser'
import multer from 'multer'
import { networkInterfaces } from 'node:os'
import cluster from 'cluster'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fileUploads = multer({})
const imageListMax = 10
const port = 10000

//console.log("__dirname:", __dirname)
const app = express()
app.set('views', __dirname + "\\AdministratorSite\\views")
app.set('view engine', 'ejs')
app.set('view cache', true)
app.use(express.json({limit: "50mb", extended: true}))
app.use(express.urlencoded({limit: "50mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}))
app.use(bodyParser.json({limit: "50mb"}))
app.use(cookieParser())
app.use(fileUploads.fields([{name: 'mainImage', maxCount: 1}, {name: 'postImage', maxCount: 1}, {name: 'images', maxCount: imageListMax}]))
app.use(express.static(join(__dirname, 'AdministratorSite')))

const activityRouter = express.Router()
const adminWebsite = express.Router()
const calendarRouter = express.Router()
const chatsRouter = express.Router()
const friendsRouter = express.Router()
const moderationRouter = express.Router()
const postRouter = express.Router()
const selectRouter = express.Router()
const trailRouter = express.Router()
const userRouter = express.Router()
const waypointRouter = express.Router()

// Getters
adminWebsite.get("/admin", (req, res) => {
    res.sendFile(join(__dirname, 'AdministratorSite', 'adminLogin.html'))
    console.log("Hit admin login")
})
adminWebsite.get("/adminActivityEdit", SolaceSQL.adminEditContent)
adminWebsite.get("/adminSJAdd", SolaceSQL.adminNavigation)
adminWebsite.get("/adminSJDelete", SolaceSQL.adminNavigation)
adminWebsite.get("/adminSJEdit", SolaceSQL.adminNavigation)
adminWebsite.get("/adminEmailVerification", (req, res) => {
    res.sendFile(join(__dirname, 'AdministratorSite', 'adminEmailVerification.html'))
})
adminWebsite.get("/adminLogin", SolaceSQL.adminLogin)
adminWebsite.get("/adminSJReport", SolaceSQL.adminNavigation)
adminWebsite.get("/adminSignUp", (req, res) => {
    res.sendFile(join(__dirname, 'AdministratorSite', 'adminSignUp.html'))
})
selectRouter.get("/activities", SolaceSQL.getAvailableActivities)
selectRouter.get("/activityComments", SolaceSQL.getActivityComments)
selectRouter.get("/activitytags", SolaceSQL.getActivityTags)
selectRouter.get("/activity", SolaceSQL.getActivity)
selectRouter.get("/calendar", SolaceSQL.getCalendarEvents)
selectRouter.get("/commentReplies", SolaceSQL.getCommentReplies)
selectRouter.get("/fpemail", SolaceSQL.ifEmailExists)
selectRouter.get("/friendrequests", SolaceSQL.getFriendRequests)
selectRouter.get("/friends", SolaceSQL.getFriends)
selectRouter.get("/login", SolaceSQL.login)
selectRouter.get("/logout", SolaceSQL.logout)
selectRouter.get("/moderationreports", SolaceSQL.getModerationReports)
selectRouter.get("/postComments", SolaceSQL.getPostComments)
selectRouter.get("/posts", SolaceSQL.getPosts)
selectRouter.get("/recommendation", SolaceSQL.getRecommendation)
selectRouter.get("/trail", SolaceSQL.getTrail)
selectRouter.get("/trails", SolaceSQL.getTrails)
selectRouter.get("/userchats", SolaceSQL.getUserChats)
selectRouter.get("/users", SolaceSQL.getUsers)
selectRouter.get("/usertags", SolaceSQL.getUserTags)
selectRouter.get("/verify", SolaceSQL.verify)
selectRouter.get("/waypoint", SolaceSQL.getWaypoint)
selectRouter.get("/waypoints", SolaceSQL.getWaypoints)

// Posters
activityRouter.post("/add", SolaceSQL.addActivity)
calendarRouter.post("/add", SolaceSQL.addCalendarEvent)
chatsRouter.post("/addFriend", SolaceSQL.addFriend)
friendsRouter.post("/add", SolaceSQL.addFriendRequest)
moderationRouter.post("/add", SolaceSQL.addModerationReport)
//postRouter.post("/", SolaceSQL.addPost)
postRouter.post("/comment", SolaceSQL.addComment)
postRouter.post("/post", SolaceSQL.addPost)
postRouter.post("/reply", SolaceSQL.addReply)
selectRouter.post("/register", SolaceSQL.register)
trailRouter.post("/", SolaceSQL.addHiking)
waypointRouter.post("/", SolaceSQL.addWaypoint)

// Putters
activityRouter.put("/counter", SolaceSQL.updateCounter)
activityRouter.put("/rating", SolaceSQL.updateRating)
activityRouter.put("/recommend", SolaceSQL.updateRecommend)
activityRouter.put("/recommendactivity", SolaceSQL.generateRecommendActivity)
calendarRouter.put("/update", SolaceSQL.updateCalendarEvent)
chatsRouter.put("/resetNM", SolaceSQL.updateNM)
chatsRouter.put("/update", SolaceSQL.updateChatFile)
postRouter.put("/comments", SolaceSQL.updatePostComments)
postRouter.put("/likes", SolaceSQL.updatePostLikes)
postRouter.put("/commentLikes", SolaceSQL.updateCommentLikes)
postRouter.put("/replyLikes", SolaceSQL.updateReplyLikes)
selectRouter.put("/logout", SolaceSQL.logout)
userRouter.put("/pwd", SolaceSQL.updatePwd)

// Deleters
activityRouter.delete("/delete", SolaceSQL.deleteActivity)
activityRouter.delete("/deleteactivitytags", SolaceSQL.deleteActivityTag)
activityRouter.delete("/deleteusertags", SolaceSQL.deleteUserTag)
calendarRouter.delete("/delete", SolaceSQL.deleteCalendarEvent)
friendsRouter.delete("/delete", SolaceSQL.deleteFriendRequest)
moderationRouter.delete("/delete", SolaceSQL.deleteModerationReport)
postRouter.delete("/delete/post", SolaceSQL.deletePost)
postRouter.delete("/delete/comment", SolaceSQL.deleteComment)
postRouter.delete("/delete/reply", SolaceSQL.deleteReply)
trailRouter.delete("/delete", SolaceSQL.deleteHiking)
userRouter.delete("/delete", SolaceSQL.deleteUser)
waypointRouter.delete("/delete", SolaceSQL.deleteWaypoint)

app.use("/", adminWebsite)
app.use("/", selectRouter)
app.use("/api/activities", activityRouter)
app.use("/api/calendar", calendarRouter)
app.use("/api/chats", chatsRouter)
app.use("/api/friendRequests", friendsRouter)
app.use("/api/moderation", moderationRouter)
app.use("/api/posts", postRouter)
app.use("/api/trails", trailRouter)
app.use("/api/users", userRouter)
app.use("/api/waypoints", waypointRouter)

/*
let credentials = {
    key: readFileSync('./cred/https/privateKey.pem', 'utf8'),
    cert: readFileSync('./cred/https/cert.pem', 'utf8'),
    passphrase: readFileSync('./cred/https/passphrase.pem', 'utf8')
}

let httpsServer = https.createServer(credentials, app)
httpsServer.listen(10000, () => {
    console.log('Listening at port: 10000')
})
*/

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < 4; i++)
        cluster.fork()

    // This event is first when worker died
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
    
    process.on('SIGINT', () => {
        for (var id in cluster.workers) {
            console.log("cluster worker:", id)
            cluster.workers[id].disconnect()
        }
        process.exit(0)
    })
}

// For Worker
else {

    // Workers can share any TCP connection
    // In this case it is an HTTP server
    app.listen(port, err => {
        err ?
            console.log("Error in server setup") :
            console.log(`Worker ${process.pid} started and listening at port: ${port}`);
    });
}



/*
app.listen(port, () => {
    console.log('Listening at port: 10000')
})
*/

/*
protocol-host = http://<pc ip address>:<port number>
Current Valid URLs:
    Adding

    protocol-host/api/activities?name=<activity>&contents=<contents>&mainImage=<image file>&mainVideo=<video link>
    protocol-host/api/activities?name=<activity>&contents=<contents>&images=<list of images>
        put image list in body
    protocol-host/api/activities?name=<activity>&contents=<contents>&videos=<list of video links>
        put video list in body
    protocol-host/api/activities?name=<activity>&contents=<contents>&images=<list of images>&videos=<list of video links>
        put lists in body
    protocol-host/api/trails?name=<name of trail>&ola=<origin latitude>&olo=<origin longitude>&dla=<destination latitude>&dlo=<destination longitude>
    protocol-host/register?pwd=<password>&email=<email address>
    protocol-host/api/posts/post?admin=<admin name>&content=<content>
    protocol-host/api/posts/post?admin=<admin name>&content=<content>&image=<post image>
    protocol-host/api/posts/comment?user=<username>&content=<content>&posted=<datetime>&postID=<post id>
    protocol-host/api/posts/reply?user=<username>&content=<content>&posted=<datetime>&commentID=<comment id>
    protocol-host/api/waypoints?route=<route name>&la=<latitude>&lo=<longitude>&order=<order number>
    protocol-host/api/chats/addFriend?user=<user name>&friend=<friend name>
    protocol-host/api/friendRequests/add?sender=<sender name>&receiver=<receiver name>&msg=<message>
    protocol-host/api/moderation/add?commentID=<comment id>
    protocol-host/api/moderation/add?replyID=<reply id>
    protocol-host/api/calendar/add?user=<username>&name=<event name>&date=<event datetime string>

    Updating

    protocol-host/api/users/pwd?newPassword=<new password>&email=<email>
    protocol-host/api/activities/counter?activity=<activity name>
    protocol-host/api/activities/rating?activity=<activity name>
    protocol-host/api/activities/recommend?activity=<activity name>
    protocol-host/logout?user=<username>
    protocol-host/api/posts/comments?postID=<post id>&increase=<0 or 1>
    protocol-host/api/posts/likes?postID=<post id>&user=<username>&increase=<0 or 1>
    protocol-host/api/posts/commentLikes?commentID=<comment id>&user=<username>&increase=<0 or 1>
    protocol-host/api/posts/replyLikes?replyID=<reply id>&user=<username>&increase=<0 or 1>
    protocol-host/api/chats/update?user=<user name>&friend=<friend name>&data=<string data>

    protocol-host/api/chats/resetNM?user=<username>&friend=<friend name>
    
    protocol-host/api/calendar/update?user=<username>&orgName=<original event name>&newName=<new event name>&orgDate=<original event datetime string>&newDate=<new event datetime string>
    
    Deleting

    protocol-host/api/users/delete?username=<user>
    protocol-host/api/activities/delete?activity=<activity name>
    protocol-host/api/trails/delete?trail=<trail name>
    protocol-host/api/waypoints/delete?route=<route name>
    protocol-host/api/friendRequests/delete?sender=<sender name>&receiver=<receiver name>
    protocol-host/api/moderation/delete?commentID=<comment id>
    protocol-host/api/moderation/delete?replyID=<reply id>
    protocol-host/api/posts/delete/comment?commentID=<comment id>
    protocol-host/api/posts/delete/reply?replyID=<reply id>
    protocol-host/api/calendar/delete?user=<username>&name=<event name>&date=<event datetime string>
    
    Getting

    protocol-host/login?loginID=<username or email>&pwd=<password>&admin=<0 or 1>
    protocol-host/fpemail?email=<email>
    protocol-host/verify?otp=<otp inputted>
    protocol-host/users
    protocol-host/activities
    protocol-host/trails
    protocol-host/activity?activityID=<activity id>
    protocol-host/trail?name=<trail name>
    protocol-host/friends?username=<user>
    protocol-host/fpemail?email=<email>
    protocol-host/posts?user=<username>
    protocol-host/postComments?postID=<post id>&user=<username>
    protocol-host/commentReplies?commentID=<comment id>&user=<username>
    protocol-host/waypoints
    protocol-host/waypoint?route=<route name>
    protocol-host/userchats?user=<username>
    protocol-host/friendrequests?receiver=<receiver name>
    protocol-host/moderationreports?admin=<administrator name>
    protocol-host/admin
    protocol-host/adminLogin
    protocol-host/adminSignUp
    protocol-host/adminSJ
    protocol-host/adminActivityEdit?id=<activity id>
    protocol-host/logout?admin=<0 or 1>
    protocol-host/calendar?user=<username>&month=<month number>
*/

// TODO: Implement a http server and https server, get protocol-host/register?pwd=<password>&email=<email address>&picture=@<picture address> (use form data), increase security with connection string

/*
Example:
    var credentials = {key: privateKey, cert: certificate};
    var express = require('express');
    var app = express();

    // your express configuration here

    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(credentials, app);

    httpServer.listen(8080);
    httpsServer.listen(8443);
*/