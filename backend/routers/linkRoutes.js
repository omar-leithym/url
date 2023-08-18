const express = require("express")
const Link = require("../models/link");
const shortid = require('shortid')
const router = express.Router();
const asyncHandler = require("express-async-handler");
const {protect} = require("../middleware/auth")
const User = require("../models/user");
const baseUrl = "http://localhost:3001/"

const getLinks = asyncHandler(async(req, res) => {
    const links = await Link.find({user: req.user.id})
    res.status(200).json(links)
})

function validateUrl(value) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i');

    return !!urlPattern.test(value);
}

function fixUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }
    return url;
}
  
const creater = asyncHandler(async(req,res) => {
    const {link, nickname} = req.body

    const links = await Link.find({user: req.user.id})
    
    if(!validateUrl(link)) {
        res.status(400).json("Link is invalid")
        return
    }
    else if(links.length >= 10) {
        res.status(400).json("A maximum of 10 links is allowed")
        return
    }
    try {
        const shortId = shortid.generate()
        const shortLink = baseUrl + shortId

        url = new Link({
            shortId,
            nickname,
            link: fixUrl(link),
            shortLink,
            user: req.user
        })

        await url.save()
        res.status(201).json(url)
    } catch (err) {
        console.log(err)
        res.status(500)
    }
    
})

const deleteLink = asyncHandler(async(req,res) => {
    const link = await Link.findById(req.params.id)

    if(!link) {
        res.status(400).json("Link not found");
    }

    const user = await User.findById(req.user.id)
    
    if(!user) {
        res.status(401).json("User not found");
    }

    if(link.user.toString() !== user.id) {
        res.status(401).json("User not authorized");
    }

    Link.findByIdAndDelete({_id: req.params.id})
    .then(doc => {
        res.status(201).json("Link deleted!")
    })
    .catch(err => {
        console.log(err)
    })
})

const updateLink = asyncHandler(async(req, res) => {
    const link = await Link.findById(req.params.id)

    if(!link) {
        res.status(400).json("Post not found");
    }

    const user = await User.findById(req.user.id)
    
    if(!user) {
        res.status(401).json("User not found");
    }

    if(link.user.toString() !== user.id) {
        res.status(401).json("User not authorized");
    }

    if(!validateUrl(req.body.link)) {
        res.status(400).json("Link is invalid")
    } else {
        const links = await Link.find({user: req.user.id})
        Link.findByIdAndUpdate({_id: req.params.id}, {
            link: fixUrl(req.body.link),
        })
        .then(doc => {
            res.status(200).json(links)
        })
        .catch(err => {
            console.log(err)
        })
    }
})

const shortlink = asyncHandler(async(req,res) => {
    try{
        const url = await Link.findOne({
            shortId: req.params.code
        })
        if(url) {
            url.clicks++;
            url.save()
            return res.redirect(url.link)
        } else {
            return res.status(404).json("Link does not exist!")
        }
    }
    catch (err) {
        console.log(err)
        res.status(500)
    }
})

router.post("/create", protect, creater)
router.get("/links", protect, getLinks)
router.put("/update/:id", protect, updateLink)
router.delete("/delete/:id", protect, deleteLink)
router.get("/:code", shortlink)

module.exports = router;