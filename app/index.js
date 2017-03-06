'use strict';
const Generator = require('yeoman-generator');
const config = require('./config.json');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.packageJsonExist = false;
        this.isSymfonyApp = false;
        this.modules = [];
        this.graphicComponents = [];
        this.appName = '';
        this.intl = false;
    }

    initializing() {
        this.log('Welcome to the "U Pro generator" !')
    }

    prompting() {
        let extraPrompt = this._extraPrompting();

        return this.prompt([...extraPrompt,
            {
                type: 'confirm',
                name: 'isSymfony',
                message: 'Is your application if running with Symfony ?',
            },
            {
                type: 'checkbox',
                name: 'graphicComponents',
                message: 'Which graphic components do you want to install ?',
                choices: config.graphicComponents,
                default: [],
            },
            {
                type: 'checkbox',
                name: 'modules',
                message: 'Which modules do you want to install ?',
                choices: config.modules,
                default: [],
            },
            {
                type: 'confirm',
                name: 'intl',
                message: 'Did your application need multilanguage management ?'
            }
        ]).then(answers => {
            this.appName = answers.appName;
            this.isSymfonyApp = answers.isSymfony;
            this.modules = answers.modules;
            this.graphicComponents = answers.graphicComponents;
            this.intl = answers.intl;
        })
    }

    writing() {
        let prefixPath = this.isSymfonyApp ? 'app/Resources' : 'src';
        this._createDirectories(prefixPath);
        this._copyTemplates(prefixPath);
    }

    install() {
        this.log('We\'re going to install what you need to build your project!');

        let dependencies = [...config.dependencies, ...this.modules, ...this.graphicComponents];
        if (this.intl) {
            dependencies = [...dependencies, 'react-intl']
        }

        this.npmInstall(dependencies, {'save': true});
        this.npmInstall(config.devDependencies, {'save-dev': true});
    }

    end() {
        this.log('See you next time !');
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

    _createDirectories(prefixPath) {
        this.log('Create directory structure ...');
        this.spawnCommand('mkdir', [
            '-p',
            prefixPath + '/js/Actions',
            prefixPath + '/js/Api',
            prefixPath + '/js/Constants',
            prefixPath + '/js/Components',
            prefixPath + '/js/Containers',
            prefixPath + '/js/Reducers',
            prefixPath + '/js/Stores',
            prefixPath + '/sass'
        ]);
    }

    _copyTemplates(prefixPath) {
        this.log('Create required files ...');
        this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), {
            name: this.appName
        });
        this.fs.copyTpl(this.templatePath('.babelrc'), this.destinationPath('.babelrc'));
        this.fs.copyTpl(this.templatePath('gulpfile.babel.js'), this.destinationPath('gulpfile.babel.js'), {
            srcPath: this.isSymfonyApp ? './app/Resources' : './src',
            distPath: this.isSymfonyApp ? './web' : './dist',
        });
        this.fs.copyTpl(this.templatePath('Constants/ActionTypes.js'), this.destinationPath(prefixPath + '/js/Constants/ActionTypes.js'));
        this.fs.copyTpl(this.templatePath('Stores/configureStore.js'), this.destinationPath(prefixPath + '/js/Stores/configureStore.js'), {
            reducer: `import reducer from '../Reducers/${this.modules.length > 0 ? 'reducer' : 'appReducer'}'`,
        });

        if (this.modules.length > 0) {
            this.fs.copyTpl(this.templatePath('Reducers/reducer.js'), this.destinationPath(prefixPath + '/js/Reducers/reducer.js'), {
                imports: this._getImports(),
                reducers: this._getReducers(),
            });
        }
        this.fs.copyTpl(this.templatePath('Reducers/appReducer.js'), this.destinationPath(prefixPath + '/js/Reducers/appReducer.js'));
        this.fs.copyTpl(this.templatePath(this.intl ? 'appIntl.js' : 'app.js'), this.destinationPath(prefixPath + '/js/app.js'));
        this.fs.copyTpl(this.templatePath('Components/App.js'), this.destinationPath(prefixPath + '/js/Components/App.js'), {
            appname: this.appName,
        });

        if (this.intl) {
            this.spawnCommand('mkdir', ['-p', prefixPath + '/js/Translations']);
            this.fs.writeJSON(prefixPath + '/js/Translations/translation.json', {
                en: {
                    greet: "Hello {name}"
                },
                fr: {
                    greet: "Bonjour {name}"
                },
            })
        }
    }

    _getImports() {
        let imports = '';
        this.modules.forEach(module => {
            let moduleName = module.replace('@upro/', '').replace('react-', '') + 'Reducer';
            imports += `import ${moduleName} from '${module}' \n`
        });

        return imports;
    }

    _getReducers() {
        let reducers = '';
        this.modules.forEach(module => {
            let moduleName = module.replace('@upro/', '').replace('react-', '');
            reducers += `\n    ${moduleName}: ${moduleName}Reducer,`
        });

        return reducers;
    }
};
