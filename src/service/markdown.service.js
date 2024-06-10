import Markdown from "../model/markdown";

let saveDoctorDetailContent = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const newMarkdown = await Markdown.create({
                doctorId: data.doctorId,
                specialtyId: data.specialtyId,
                contentHTML: data.contentHTML,
                contentMarkdown: data.contentMarkdown,
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: newMarkdown
            }); 
        } catch (error) {
            reject(error);
        }
    });
}

let getDoctorMarkdownContent = (doctorId) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('haha::');
            const doctorContent = await Markdown.findOne({
                where: {
                    doctorId: doctorId
                }
            });

            console.log('check doctor content::', doctorContent);

            resolve({
                errCode: 0,
                message: 'OK',
                data: doctorContent
            })
        } catch (error) {
            reject(error)
        }
    })
}

let getSpecialtyMarkdownContent = (specialtyId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const specialtyContent = await Markdown.findOne({
                where: {
                    specialtyId: specialtyId
                }
            });

            resolve({
                errCode: 0,
                message: 'OK',
                data: specialtyContent
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    saveDoctorDetailContent,
    getDoctorMarkdownContent,
    getSpecialtyMarkdownContent
};
