var dhost = document.URL.substring(0, document.URL.lastIndexOf("/"))

function adminSendLogin(e) {
    e.preventDefault()
    let lf = new URLSearchParams(new FormData(document.getElementById("adminLogin")))
    fetch(`${dhost}/adminLogin?${lf}`)
    .then(response => {
        if (!response.ok)
            return response.json().then(err => {
                throw new Error(err)
            })
        // Redirect to the main page
        console.log("response.url", response.url)
        window.location.href = response.url
    }).catch(err => {
        console.error("from fetch catch", err)
        let error = document.getElementById("error_message")
        error.style.display = "block"
        error.innerHTML = err.message
        document.getElementById("login").classList.add("errors")
        document.getElementById("password").classList.add("errors")
    })
}

function noErrors() {
    document.getElementById("login").classList.remove("errors")
    document.getElementById("password").classList.remove("errors")
    document.getElementById("error_message").style.display = "none"
}

function fillReports() {
    // activate when Reports tab clicked or onReload
    let commentReports = document.getElementById("CommentReports")
    let replyReports = document.getElementById("ReplyReports")
    commentReports.style.display = "block"
    replyReports.style.display = "block"
    fetch(`${dhost}/moderationreports?admin=${document.getElementById("admin").value}`)
    .then(response => {
        console.log("response:", response)
        commentReports.innerHTML = ""
        replyReports.innerHTML = ""
    })
}

async function fillEditContent(evt) {
    // TODO: Fill in activity or post with selected name from dropdown list
    console.log("Editing content")
    if (document.getElementById("activity_edit_list").selectedIndex == 0) {
        document.getElementById("Activity").style.display = "none"
        document.getElementById("submit").style.display = "none"
        return
    }
    let response = await fetch(`${dhost}/adminActivityEdit?id=${evt.target.value}`)
    let activity = await response.json()
    console.log("response:", activity)
    let isEdit = document.querySelector('[href="#"]').innerHTML == "Edit"
    console.log("isEdit:", isEdit)
    let mainImage = document.getElementById("activityName")
    mainImage.value = activity['Name']
    sessionStorage.setItem("activityName", activity['Name'])
    mainImage.setAttribute("size", activity['Name'].length)
    document.getElementById("activity content").innerHTML = activity['Contents']
    sessionStorage.setItem("activity content", activity['Contents'])
    document.getElementById("main_image").setAttribute("src", activity['Main Image']['buffer'])
    document.getElementById("main_filename").innerHTML = `Inserted Main Image Filename: ${activity['Main Image']['filename']}`
    let mainVideo = document.getElementById("mainvideo")
    mainVideo.value = activity['Main Video']
    sessionStorage.setItem("mainvideo", activity['Main Video'])
    mainVideo.setAttribute("size", activity['Main Video'].length)
    document.getElementById("main_video").setAttribute("src", activity['Main Video'])
    if (isEdit) {
        if (activity['Images'].length) {
            // Only one list is allowed to add items to submit
            document.getElementById("videoAdd").style.display = "none"
            if (activity['Images'].length == 10)
                document.getElementById("imageAdd").style.display = "none"
        }
        else if (activity['Videos'].length) {
            // Only one list is allowed to add items to submit
            document.getElementById("imageAdd").style.display = "none"
            if (activity['Videos'].length == 10)
                document.getElementById("videoAdd").style.display = "none"
        }
    }
    
    let imageList = document.getElementById("imageList")
    imageList.innerHTML = ""
    activity['Images'].forEach((image) => {
        // Create div list item of image or video lists
        let listPoint = document.createElement("div")
        listPoint.setAttribute("class", "imageItem")
        // Create step description input
        let stepDesc = document.createElement("input")
        stepDesc.setAttribute("class", "stepDesc")
        stepDesc.setAttribute("type", "text")
        stepDesc.setAttribute("placeholder", "Step Description")
        stepDesc.setAttribute(isEdit ? "required" : "readonly", "")
        stepDesc.value = image['Step Description']
        sessionStorage.setItem(`activity SD ${image['Step']}`, image['Step Description'])
        stepDesc.style.display = "block"
        // Create the image or video input
        let media = document.createElement("input")
        media.setAttribute("class", "image")
        media.setAttribute("name", "images")
        media.setAttribute("type", "file")
        media.setAttribute("accept", ".jpeg, .png, .ico")
        media.setAttribute(isEdit ? "required" : "readonly", "")
        // Create cancel icon button to remove input from list
        let xIcon
        if (isEdit) {
            xIcon = document.createElement("button")
            xIcon.setAttribute("class", "xIcon")
            xIcon.setAttribute("onclick", "removeMedia(event)")
            xIcon.innerHTML = "&#10006;"
        }
        // Create inserted image
        let insertedLabel = document.createElement("label")
        insertedLabel.innerHTML = `Inserted Image at Step ${image['Step']}`
        let insertedImage = document.createElement("img")
        insertedImage.setAttribute("src", image['Picture']['buffer'])
        insertedImage.setAttribute("alt", `Image on Step ${image['Step']}`)
        let insertedFilename = document.createElement("p")
        insertedFilename.innerHTML = `Insert Image Filename at Step ${image['Step']}: ${image['Picture']['filename']}`
        
        listPoint.appendChild(stepDesc)
        listPoint.appendChild(media)
        if (isEdit)
            listPoint.appendChild(xIcon)
        listPoint.appendChild(insertedLabel)
        listPoint.appendChild(insertedImage)
        listPoint.appendChild(insertedFilename)
        imageList.appendChild(listPoint)
    })
    let videoList = document.getElementById("videoList")
    videoList.innerHTML = ""
    activity['Videos'].forEach((video) => {
        // Create div list item of image or video lists
        let listPoint = document.createElement("div")
        listPoint.setAttribute("class", "videoItem")
        // Create step description input
        let stepDesc = document.createElement("input")
        stepDesc.setAttribute("class", "stepDesc")
        stepDesc.setAttribute("type", "text")
        stepDesc.setAttribute("placeholder", "Step Description")
        stepDesc.setAttribute(isEdit ? "required" : "readonly", "")
        stepDesc.value = video['Step Description']
        sessionStorage.setItem(`video SD ${video['Step']}`, video['Step Description'])
        stepDesc.style.display = "block"
        // Create the image or video input
        let media = document.createElement("input")
        media.setAttribute("class", "video")
        media.setAttribute("name", "videos")
        media.setAttribute("type", "url")
        media.setAttribute("pattern", "https://.*")
        media.setAttribute("size", video['Video'].length)
        media.setAttribute(isEdit ? "required" : "readonly", "")
        media.value = video['Video']
        sessionStorage.setItem(`video ${video['Step']}`, video['Video'])
        // Create cancel icon button to remove input from list
        let xIcon
        if (isEdit) {
            xIcon = document.createElement("button")
            xIcon.setAttribute("class", "xIcon")
            xIcon.setAttribute("onclick", "removeMedia(event)")
            xIcon.innerHTML = "&#10006;"
        }
        // Create inserted image
        let insertedLabel = document.createElement("label")
        insertedLabel.innerHTML = `Inserted Video at Step ${video['Step']}`
        let insertedVideo = document.createElement("iframe")
        insertedVideo.setAttribute("class", "inserted_video")
        insertedVideo.setAttribute("src", video['Video'])
        insertedVideo.setAttribute("alt", `Video on Step ${video['Step']}`)
        insertedVideo.setAttribute("height", 200)
        insertedVideo.setAttribute("width", 300)
        insertedVideo.style.display = "block"
        
        listPoint.appendChild(stepDesc)
        listPoint.appendChild(media)
        if (isEdit)
            listPoint.appendChild(xIcon)
        listPoint.appendChild(insertedLabel)
        listPoint.appendChild(insertedVideo)
        videoList.appendChild(listPoint)
    })
    document.getElementById("Activity").style.display = "block"
    let submitButton = document.getElementById("submit")
    submitButton.style.display = "block"
    if (isEdit)
        submitButton.disabled = true
}

function openTab(e, tabName) {
    var tabcontent, tablinks, i, page
    tabcontent = document.getElementsByClassName("tabcontent")
    for (i = 0; i < tabcontent.length; i++)
        tabcontent[i].style.display = "none"
    tablinks = document.getElementsByClassName("tablink")
    for (i = 0; i < tablinks.length; i++)
        tablinks[i].className = tablinks[i].className.replace(" active", "")
    page = document.querySelector('[href="#"]').innerHTML
    if (page == "Edit" || page == "Delete") {
        if (tabName == "Activity") {
            document.getElementById("activity_edit_list").style.display = "block"
        }
        else {
            posts = document.getElementsByClassName(tabName)
            for (i = 0; i < posts.length; i++)
                posts[i].style.display = "block"
        }
        e.currentTarget.className += " active"
        document.getElementById("submit").style.display = "none"
    }
    else {
        document.getElementById(tabName).style.display = "block"
        e.currentTarget.className += " active"
        let submitButton = document.getElementById("submit")
        submitButton.innerHTML = `Submit ${tabName}`
        submitButton.setAttribute("name", tabName)
    }
    switch (page) {
        case "Add":
            document.getElementById('modalBody').innerHTML = `${tabName} Is Inserted`
            break
        case "Edit":
            document.getElementById('modalBody').innerHTML = `${tabName} Is Edited`
            break
        case "Delete":
            document.getElementById('modalBody').innerHTML = `${tabName} Is Deleted`
            break
    }
}

function handleSubmit(evt) {
    evt.preventDefault()
    const isPost = evt.target.name == "Post"
    let form = document.getElementById(evt.target.name)
    if (!form.checkValidity()) {
        console.log(`${evt.target.name} form not valid`)
        // TODO: Get list of invalid elements and get CSS running with custom messages
        let invalidList = form.querySelectorAll(":invalid")
        for (let i = 0; i < invalidList.length; i++) {
            console.log("invalid item:", invalidList[i])
            invalidList[i].classList.add("errors")
        }
        return    
    }
    const [url, query, requestBody] = queryBodyCreation(isPost, form)
    console.log("url:", url, ", query:", query.toString())
    fetch(`${url}${query}`, {
        method: 'POST',
        body: requestBody
    })
    .then(response => {
        console.log("response:", response)
        //document.getElementById("submission").style.display = "block"
        form.reset()
        if (!isPost) {
            document.getElementById("imageList").innerHTML = ""
            document.getElementById("videoList").innerHTML = ""
            document.getElementById("imageAdd").style.display = "block"
            document.getElementById("videoAdd").style.display = "block"
        }
        openModal()
    })
}

function queryBodyCreation(isPost, form) {
    if (isPost) {
        let formData = new FormData(form)
        let imageData = ""
        console.log("postImage:", formData.get("postImage").name)
        if (formData.get("postImage").name !== "") {
            imageData = new FormData()
            imageData.append("postImage", formData.get("postImage"))
        }
        formData.delete("postImage")
        return [`${dhost}/api/posts/post?`, new URLSearchParams(formData), imageData]
    }
        
    else {
        let formU = new FormData(form)
        let listData = new FormData()
        listData.append("mainImage", formU.get("mainImage"))
        formU.delete("mainImage")
        let videoLink = formU.get("mainvideo")
        if (videoLink.includes("www.youtube.com/watch"))
            formU.set("mainvideo", `https://www.youtube.com/embed/${videoLink.substring(videoLink.lastIndexOf('=') + 1)}`)
        const formQuery = new URLSearchParams(formU)
        const imageList = document.getElementById("imageList")
        const videoList = document.getElementById("videoList")
        const images = imageList.getElementsByClassName("image")
        const imageSteps = imageList.getElementsByClassName("stepDesc")
        const videos = videoList.getElementsByClassName("video")
        const videoSteps = videoList.getElementsByClassName("stepDesc")
        if (videos.length) {
            for (let i = 0; i < videos.length; i++) {
                console.log("video:", videos[i], ", step:", videoSteps[i])
                // TODO: If video is youtube link, then use the https://www.youtube.com/embed/<video id>
                let videoLink = videos[i].value
                if (videoLink.includes("www.youtube.com/watch"))
                    videos[i].value = `https://www.youtube.com/embed/${videoLink.substring(videoLink.lastIndexOf('=') + 1)}`
                listData.append("videoSteps", videoSteps[i].value)
                listData.append("videos", videos[i].value)
            }
        }
        else if (images.length) {
            for (let i = 0; i < images.length; i++) {
                console.log("image:", images[i], ", step:", imageSteps[i])
                listData.append("imageSteps", imageSteps[i].value)
                listData.append("images", images[i].files[0])
            }
        }
        return [`${dhost}/api/activities/add?`, formQuery, listData]
    }
}

function handleEdit(evt) {
    evt.preventDefault()
    const isPost = evt.target.name == "Post"
    let form = document.getElementById(evt.target.name)
    if (!form.checkValidity()) {
        console.log(`${evt.target.name} form not valid`)
        // TODO: Get list of invalid elements and get CSS running with custom messages
        let invalidList = form.querySelectorAll(":invalid")
        for (let i = 0; i < invalidList.length; i++) {
            console.log("invalid item:", invalidList[i])
            invalidList[i].classList.add("errors")
        }
        return    
    }
    const [url, query, requestBody] = queryBodyCreation(isPost, form)
    console.log("url:", url, ", query:", query.toString())
    fetch(`${url}${query}`, {
        method: 'POST',
        body: requestBody
    })
    .then(response => {
        console.log("response:", response)
        //document.getElementById("submission").style.display = "block"
        form.reset()
        if (!isPost) {
            document.getElementById("imageList").innerHTML = ""
            document.getElementById("videoList").innerHTML = ""
            document.getElementById("imageAdd").style.display = "block"
            document.getElementById("videoAdd").style.display = "block"
        }
        openModal()
    })

}

function handleDelete(evt) {
    evt.preventDefault()
    //console.log(evt.target.id)
    //console.dir(evt.target.parentNode)
    const isPost = evt.target.id == ""
    let url
    if (isPost) {
        url = `${dhost}/api/posts/delete/post?postID=${evt.target.getAttribute("data-post")}`
        if (document.getElementById(`post_filename_${evt.target.getAttribute("data-post")}`) !== null) {
            let fileP = document.getElementById(`post_filename_${evt.target.getAttribute("data-post")}`).innerHTML
            url += `&filename=${fileP.substring(fileP.lastIndexOf(" ") + 1)}`
        }
            
    }
    else
        url = `${dhost}/api/activities/delete?activityID=${document.getElementById("activity_edit_list").value}`
    
    fetch(url, {
        method: 'DELETE'
    })
    .then(response => {
        console.log("response:", response)
        
        if (isPost) {
            evt.target.parentNode.remove()
        }
        else {
            document.getElementById("activityName").value = ""
            document.getElementById("activity content").innerHTML = ""
            document.getElementById("main_image").setAttribute("src", "")
            document.getElementById("main_filename").innerHTML = ""
            document.getElementById("mainvideo").value = ""
            document.getElementById("main_video").setAttribute("src", "")
            document.getElementById("imageList").innerHTML = ""
            document.getElementById("videoList").innerHTML = ""
            let activityList = document.getElementById("activity_edit_list")
            activityList.remove(activityList.selectedIndex)
            activityList.selectedIndex = 0
            document.getElementById("Activity").style.display = "none"
            document.getElementById("submit").style.display = "none"
        }
        openModal()
    })

}

function loginCheck() {
    let pass = document.getElementById("password")
    if (pass.value.length < 8) {
        pass.classList.remove("valid")
        pass.classList.add("notValid")
    }
    else {
        pass.classList.remove("notValid")
        pass.classList.add("valid")
    }
}

function addMedia(e) {
    e.preventDefault()
    const isAddImage = e.target.id == "imageAdd"
    // Create div list item of image or video lists
    let listPoint = document.createElement("div")
    listPoint.setAttribute("class", isAddImage ? "imageItem" : "videoItem")
    // Create step description input
    let stepDesc = document.createElement("input")
    stepDesc.setAttribute("class", "stepDesc")
    stepDesc.setAttribute("type", "text")
    stepDesc.setAttribute("placeholder", "Step Description")
    stepDesc.setAttribute("required", "")
    stepDesc.style.display = "block"
    // Create the image or video input
    let media = document.createElement("input")
    media.setAttribute("class", isAddImage ? "image" : "video")
    media.setAttribute("name", isAddImage ? "images" : "videos")
    media.setAttribute("type", isAddImage ? "file" : "url")
    media.setAttribute(isAddImage ? "accept" : "pattern", isAddImage ? ".jpeg, .png, .ico" : "https://.*")
    media.setAttribute("required", "")
    // Create cancel icon button to remove input from list
    let xIcon = document.createElement("button")
    xIcon.setAttribute("class", "xIcon")
    xIcon.setAttribute("onclick", "removeMedia(event)")
    xIcon.innerHTML = "&#10006;"
    // Access image or video list to append new div item
    let mediaList = document.getElementById(isAddImage ? "imageList" : "videoList")
    listPoint.appendChild(stepDesc)
    listPoint.appendChild(media)
    listPoint.appendChild(xIcon)
    mediaList.appendChild(listPoint)
    let listLength = mediaList.getElementsByTagName("div").length
    // Both lists should not be more than 10 items long
    if (listLength == 10)
        e.target.style.display = "none"
    // Only one list is allowed to add items to submit
    document.getElementById(isAddImage ? "videoAdd" : "imageAdd").style.display = "none"
}

function removeMedia(e) {
    e.preventDefault()
    const isRemImage = e.target.parentNode.className == "imageItem"
    const mediaList = document.getElementById(isRemImage ? "imageList" : "videoList")
    mediaList.removeChild(e.target.parentNode)
    document.getElementById(isRemImage ? "imageAdd" : "videoAdd").style.display = "block"
    // Reimplement adding links when the > 0 list is 0
    if (mediaList.getElementsByClassName(isRemImage ? "imageItem" : "videoItem").length == 0)
        document.getElementById(isRemImage ? "videoAdd" : "imageAdd").style.display = "block"
}

function openNav() {
    document.getElementById("sidenav").style.width = "250px";
    document.getElementById("main").style.marginRight = "250px";
}

function closeNav() {
    document.getElementById("sidenav").style.width = "0";
    document.getElementById("main").style.marginRight = "0";
}

function openModal() {
    document.getElementById("successModal").classList.add('openSuccessModal')
    setTimeout(() => {document.getElementById('successModal').classList.remove('openSuccessModal')}, 3000)
}

function inputChanged(evt) {
    let original = sessionStorage.getItem(evt.target.name)
    if (evt.target.value != original) {
        document.getElementById(evt.target.name).setAttribute("data-changed", "")
        document.getElementById("submit").disabled = false
    }
}