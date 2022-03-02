const sgMail = require("@sendgrid/mail")


sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "ayushkayshab04@gmail.com",
        subject: "Welcome to thhe app",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}


const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "ayushkayshab04@gmail.com",
        subject: "Leaving mail",
        text: `Hi , ${name}. why are you leaving this app`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}