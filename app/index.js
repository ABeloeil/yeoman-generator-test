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

  writing() {
    this.log('We\'re going to create structure of your app.');
    if (!this.packageJsonExist) {
      this.fs.copyTpl(
        this.templatePath('package.json'),
        this.destinationPath('package.json'),
        {name: this.appName}
      )
    }
    let prefixPath = this.isSymfonyApp ? 'app/Resources' : 'src';

    if (!this.fs.exists(prefixPath)) {
      this.spawnCommand('mkdir', [prefixPath]);
    }

    this.spawnCommand('mkdir', [prefixPath + '/js']);
    this.spawnCommand('mkdir', [prefixPath + '/scss']);
  }

  install() {
    this.log('We\'re going to install what you need to build your project!');
    this.npmInstall([...dependencies, ...this.uproModules], {'save': true});
    this.npmInstall(devDependencies, {'save-dev': true});
  }
};
