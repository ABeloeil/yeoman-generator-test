'use strict';
const Generator = require('yeoman-generator');

const devDependencies = [
    'babel', 'webpack', 'babel-preset-es2015', 'babel-preset-react'
];
const dependencies = ['react', 'react-dom', 'redux', 'react-redux'];

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.packageJsonExist = false;
        this.isSymfonyApp = false;
        this.uproModules = [];
        this.appName = '';
    }

    initializing() {
        this.packageJsonExist = this.fs.exists('package.json');
    }

    prompting() {
        let extraPrompt = this._extraPrompting();

        return this.prompt([...extraPrompt,
            {
                type: 'confirm',
                name: 'isSymfony',
                message: 'Is your application if runnign with Symfony ?',
            },
            {
                type: 'checkbox',
                name: 'uproModules',
                message: 'Which UPro module do you want to install ?',
                choices: [
                    {name: "react-wizard", value:"@upro/react-wizard"},
                    {name: "react-modal", value: "@upro/react-modal"},
                ],
                default: [],
            }
        ]).then(answers => {
            this.appName = answers.appName;
            this.isSymfonyApp = answers.isSymfony;
            this.uproModules = answers.uproModules;
        })
    }

    writing() {
        this._createDirectories();
        this._copyTemplates();
    }

    install() {
        this.log('We\'re going to install what you need to build your project!');
        this.npmInstall([...dependencies, ...this.uproModules], {'save': true});
        this.npmInstall(devDependencies, {'save-dev': true});
    }

    _extraPrompting() {
        if (!this.packageJsonExist) {
            return [{
                type: 'input',
                name: 'appName',
                message: 'How do you want to name your app ?',
                default: this.appname
            }]
        }

        return [];
    }

    _createDirectories() {
        let prefixPath = this.isSymfonyApp ? 'app/Resources' : 'src';

        this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Actions']);
        this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Api']);
        this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Constants']);
        this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Components']);
        this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Containers']);
        this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Reducers']);
        this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Stores']);
        this.spawnCommand('mkdir', ['-p', prefixPath + '/scss']);
    }

    _copyTemplates() {
        this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), {
          name: this.appName
        });
        this.fs.copyTpl(this.templatePath('.babelrc'), this.destinationPath('.babelrc'));
        this.fs.copyTpl(this.templatePath('gulpfile.babel.js'), this.destinationPath('gulpfile.babel.js'), {
            srcPath: this.isSymfonyApp ? './app/Resources' : './src',
            distPath: this.isSymfonyApp ? './web' : './dist',
        });
    }
};
