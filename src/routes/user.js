const express = require("express");
const User = require("../modles/user.js")
const auth = require("../middleware/auth.js")
const multer = require("multer")
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/account.js")
const sharp = require("sharp")

const upload = multer({
    limits: {
        fileSize: 2500000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|JPEG|JPG|png|PNG)$/)) {
            return cb(new Error("Please provide a word document"))
        }

        cb(undefined, true)

    }
})

const router = express.Router();



router.get("/me", auth, async (req, res) => {
    res.send(req.user)
})

router.post("/", async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post("/logout", auth, async (req, res) => {
    try {
        req.user.token = req.user.token.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
router.post("/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/me/avatar", auth, upload.single("Avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
    req.user.avatar = buffer

    await req.user.save()
    res.send(req.user)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete("/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send("Done")
})


router.delete("/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send("no user available")
    }
})
router.patch("/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', "email", "password", "age"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send({ error: "invalid updates" })


    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()

    }
})

router.get("/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || user.avatar) {
            res.set('Content-Type', 'image/png')
            res.send(user.avatar)
        } else {
            res.status(400).send()
        }

    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
})





module.exports = router;
