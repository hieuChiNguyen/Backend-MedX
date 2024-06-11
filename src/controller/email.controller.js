import emailService from '../service/email.service'

let sendFeedBack = async (req, res) => {
    const data = req.body

    let emailSent = await emailService.sendFeedBack(data)
    if (emailSent.errCode === 0) {
        return res.status(200).json(emailSent)
    } else {
        return res.status(400).json(emailSent)
    }  
};

module.exports = {
    sendFeedBack
}