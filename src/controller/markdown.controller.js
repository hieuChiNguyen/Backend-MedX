import markdownService from '../service/markdown.service'

let saveDoctorDetailContent = async (req, res) => {
    try {
        let data = req.body;

        console.log('check data::', data);

        let new_markdown = await markdownService.saveDoctorDetailContent(data);
        console.log('check new_markdown::', new_markdown);

        if (new_markdown.errCode === 0) {
            return res.status(201).json(new_markdown);
        } 
    } catch (error) {
        return res.status(400).json({
            errCode: 2,
            message: 'Lưu thông tin thất bại.'
        });
    }
}

let getDoctorMarkdownContent = async (req, res) => {
    console.log('haha::2');
    const doctorId = req.params.doctorId
    console.log('haha1::');
    console.log('doctorId::', doctorId);
    let doctorContent = await markdownService.getDoctorMarkdownContent(doctorId);

    if (doctorContent.errCode === 0) {
        return res.status(200).json(doctorContent);
    } 
}

let getSpecialtyMarkdownContent = async (req, res) => {
    const specialtyId = req.params.specialtyId
    let specialtyContent = await markdownService.getSpecialtyMarkdownContent(specialtyId);

    if (specialtyContent.errCode === 0) {
        return res.status(200).json(specialtyContent);
    } 
}

module.exports = {
    saveDoctorDetailContent,
    getDoctorMarkdownContent,
    getSpecialtyMarkdownContent
}