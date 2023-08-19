const { Router } = require('express');
const path = require('path');
const Methods = require('./methods');
const fs = require('fs').promises;

const router = Router();

router.get('/', async (req, res) => {
    const contents = new Methods();
    const files = await contents.getAllFiles();
    const route = Methods.generateRoute()

    res.render('app', { files, route })
})

router.post('/getFiles', async (req, res) => {
    const options = req.body;

    const contents = new Methods(options);
    const files = await contents.getAllFiles();
    const route = Methods.generateRoute()

    res.json({ files, route })
})

const folderStructure = {
    structure: {
        assets: {
            images: {},
            styles: {
                'common.css': {
                    content: 'css'
                },
                'home.css': {
                    content: 'start css'
                }
            },
            scripts: {
                'common.js': {
                    content: 'js'
                },
            }
        },
        controllers: {
            'userController.js': {
                content: 'usercon js'
            }
        },
        Methods: {
            'Methods.js': {
                content: 'methods js'
            },
            'Model.js': {
                content: '//model file'
            }
        },
        pages: {
            partials: {
                'alert.ejs': {
                    content: 'alert file'
                },
                'loader.ejs': {
                    content: 'loader file'
                },
            },
            'index.ejs': {
                content: 'html'
            }
        },
        '.gitignore': {
            content: '/node_modules'
        },
        'server.js': {
            content: 'server js'
        }
    }
}

async function lol() {
    const project = new Methods(folderStructure);
    await project.setupProjectFile();
}
// lol();


module.exports = router