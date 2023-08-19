const path = require('path');
const fs = require('fs').promises;
const mime = require('mime-types');
const Comments = require('./comments');
const baseFile = 'Websites';
const basePath = path.join(__dirname, '..', '..', baseFile)

var currentFilePath = basePath;
// var currentFilePath = path.join(basePath, 'empty');

const changeDir = (filePath) => {
    const folderPath = path.join(currentFilePath, filePath);
    (Methods.checkFilePath(folderPath)) ? currentFilePath = folderPath : currentFilePath = basePath;
    return currentFilePath;
};

const mkDirOrFile = async (route, content = '') => {
    try {
        (route.includes('.'))
            ?
            await fs.writeFile(route, content, { flag: 'w' })
            :
            await fs.mkdir(route)
    } catch (error) {
        console.log(error);
    }
}

const isBase = (filePath) => filePath.toLowerCase().startsWith(basePath.toLowerCase());


// console.log(Comments.getComment('issue'));

//this.filePath is used for changing directories
//this.path is used for methods that need a path to function
class Methods {
    constructor(params = {}) {
        if (typeof params == 'object') Object.assign(this, params);

        if (this?.filePath) changeDir(this.filePath);
    }

    async getAllFiles() {
        const filePath = currentFilePath;

        try {
            let hasAccess = await this.constructor.checkFilePath(filePath);

            if (!hasAccess) return { error: Comments.getComment('doesnt exist') }

            let contents = await fs.readdir(filePath);
            let files = await this.filesAndFolders(contents, filePath);

            if (this.constructor.isEmptyObject(files)) files.error = Comments.getComment('empty')

            files.isBase = isBase(filePath);
            (files.isBase) ? files.alert = false : files.alert = Comments.getComment('no access', baseFile);

            return files;

        } catch (err) {
            console.log(err);
            return { error: Comments.getComment('issue') }
        }
    }

    static async checkFilePath(filePath) {
        try {
            await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') console.log(`${filePath}, doesn't exist`);
            else if (error.code === 'EEXIST') console.log(`${filePath}, already exist`);
            else console.log(error);
            return false;
        }
    }

    async filesAndFolders(contents = [], filePath) {
        if (!contents.length) return {}
        const files = {
            folder: [],
            image: [],
            video: [],
            file: [],
        }

        for (const item of contents) {
            const itemPath = path.join(filePath, item);
            try {
                const stats = await fs.stat(itemPath);
                const mimeType = mime.lookup(itemPath);

                if (stats.isDirectory()) files.folder.push(item)
                else {
                    if (mimeType) {
                        if (mimeType.startsWith('image/')) files.image.push(item)
                        else if (mimeType.startsWith('video/')) files.video.push(item)
                        else files.file.push(item)
                    } else files.file.push(item)
                }
            } catch (err) {
                continue;
            }
        }

        return files;
    }

    static isEmptyObject(obj = {}) {
        return Object.keys(obj).length === 0;
    }

    static generateRoute(route = currentFilePath) {
        let resultHTML = '';
        const parts = route.split(path.sep);

        const staticPath = (parts.slice(parts.indexOf(baseFile) + 1)).join(path.sep);

        const head = parts.splice(parts.length - 1);
        const routeParts = parts.splice(-3);

        const result = { head, routeParts, staticPath };
        if (result?.routeParts) {
            result.routeParts.forEach((item, index) => {
                resultHTML += `<p class="transparent">${item}</p>`;
                if (index !== result.routeParts.length - 1) {
                    resultHTML += '<i class="fa-solid fa-angle-right transparent"></i>';
                }
            });
        }
        result.html = resultHTML;

        return result;
    }

    //--------------------------------------------------
    //Power Houses
    //--------------------------------------------------

    //Setup a new project file.
    async setupProjectFile() {
        this.folderStructure = [];
        const folder = path.join(currentFilePath, 'test-folder');

        const hasAccess = await this.constructor.checkFilePath(folder);
        if (!hasAccess) mkDirOrFile(folder)

        this.loopProjectFiles(this.structure)

        for (let i = 0; i < this.folderStructure.length; i++) {
            const current = this.folderStructure[i];
            const isArray = Array.isArray(current);

            const route = path.join(folder, isArray ? current[0] : current);
            const content = isArray ? await this.getFileContent(current[1]) : '';

            const hasAccess = await this.constructor.checkFilePath(route)
            if (!hasAccess) mkDirOrFile(route, content);
        }
    }

    loopProjectFiles(structure, dir = '') {
        for (const [key, value] of Object.entries(structure)) {
            if (typeof value === 'object' && value !== null) {
                if (key.includes('.')) this.folderStructure.push([`${dir}/${key}`, value.content])
                else this.folderStructure.push(`${dir}/${key}`);
                this.loopProjectFiles(value, dir + `/${key}`);
            }
        }
    }

    async getFileContent(type = '') {
        try {
            let term = type.toUpperCase();
            const template = await fs.readFile(path.join(__dirname, '..', 'pages', 'template.html'), 'utf-8')
            const start = `<!-- ${term} start -->`;
            const end = `<!-- ${term} end -->`;
            let html = '';

            const startIndex = template.indexOf(start);
            const endIndex = template.indexOf(end);

            if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
                html = template.substring(startIndex + start.length, endIndex).trim();
                const skip = (term.includes('JS')) ? '<script>'.length : (term.includes('CSS')) ? '<style>'.length : 0;
                if (skip) html = html.substring(skip, (html.length - (skip + 1)));
                return html;
            } else return type;

        } catch (error) {
            console.log('Error reading the template file:', error);
            return '';
        }
    }

    // async cloneResults(files = {}) {
    //     if (this.constructor.isEmptyObject(files)) return false;
    //     const explore = path.join(__dirname, '..', 'explore');

    //     for (const key in files) {
    //         if (key == 'images' || key == 'videos') {
    //             for (let i = 0; i < files[key].length; i++) {
    //                 try {
    //                     await fs.copyFile(path.join(this.filePath, files[key][i]), explore)
    //                 } catch (err) {
    //                     console.error(`Error copying file ${files[key][i]}:`, err);
    //                     break;
    //                 }
    //             }
    //         }
    //     }
    // }

}

module.exports = Methods;