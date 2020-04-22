const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'info@brandednomad.com',
        subject:'Welcome to Fitness Pal!',
        text:`Welcome to Fitness Pal, ${name}. Let me know how you get along with the app.`
    })
};

const sendCancellationEmail = (email,name)=>{
    sgMail.send({
        to:email,
        from:'info@brandednomad.com',
        subject:"Sad to see you go",
        text:`We are sad to see you go ${name}. We hope to see you again soon.`
    })
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};