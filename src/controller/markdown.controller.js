import markdownService from '../service/markdown.service'

let saveDoctorDetailContent = async (req, res) => {
    try {
        let data = req.body;

        let new_markdown = await markdownService.saveDoctorDetailContent(data);

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
    const doctorId = req.params.doctorId
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