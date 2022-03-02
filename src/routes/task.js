const Task = require("../modles/task.js")
const express = require("express")
const auth = require("../middleware/auth")
const router = express.Router();

router.get("/", auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }
    try {
        await req.user.populate({
            path: "tasks",
            match: match,
            options: {
                skip: parseInt(req.query.skip),
                limit: parseInt(req.query.limit),
                sort: sort

            }
        }).execPopulate()
        res.send(req.user.task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get("/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        console.log(task)
        if (!task) res.status(404).send()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
        console.log(e)
    }
})

router.delete("/:id", auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) res.status(404).send()
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


router.patch("/:id", auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send({ error: "invalid updates" })

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) res.status(400).send("Task with given id id not found")

        updates.forEach((update) => { task[update] = req.body[update] })
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post("/", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }


})

module.exports = router;