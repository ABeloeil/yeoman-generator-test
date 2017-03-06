import gulp from 'gulp'
import sourcemaps from 'gulp-sourcemaps'
import webpack from 'webpack'
import stream from 'webpack-stream'
import babel from 'gulp-babel'
import plumber from 'gulp-plumber'
import named from 'vinyl-named'
import util from 'gulp-util'
import sass from 'gulp-sass'
import cleanCss from 'gulp-clean-css'
import rename from 'gulp-rename'

let prod = !!util.env.production;

let config = {
    devtool: !prod ? 'source-map' : 'hidden-source-map',
    module: {
        loaders: [
            {test: /\.json?$/, loader: "json-loader"},
            {test: /\.js?$/, exclude: /node_modules/,loader: "babel"},
            {test: /\.css$/, loaders: ["style-loader", "css-loader"]}
        ]
    },
    plugins: prod ? [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "commons",
                filename: "commons.js",
                minChunks: 2,
            }),
            new webpack.optimize.UglifyJsPlugin({compressor: { warnings: false }})
        ] : [
            new webpack.optimize.CommonsChunkPlugin({
                name: "commons",
                filename: "commons.js",
                minChunks: 2,
            }),
        ]
};

let srcFiles = {
    sass: [
        '<%= srcPath %>/sass/style.scss',
    ],
    js: [
        '<%= srcPath %>/js/app.js',
    ]
};

gulp.task('sass', () => {
    gulp.src(srcFiles.sass)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('<%= distPath %>/css/'))
});

gulp.task('webpack', () => {
    gulp.src(srcFiles.js)
        .pipe(plumber())
        .pipe(babel())
        .pipe(named())
        .pipe(stream(config))
        .pipe(rename({suffix: prod ? '.min' : ''}))
        .pipe(gulp.dest('<%= distPath %>/js'))
});

gulp.task('minify:css', () => {
    return gulp.src(['<%= distPath %>/css/style.css'])
        .pipe(cleanCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('<%= distPath %>/css'))
});

gulp.task('watch',() => {
    gulp.watch('<%= srcPath %>/sass/**/*.scss', ['sass','minify:css']);
    gulp.watch(['<%= srcPath %>/js/**/*.js*'], ['webpack']);
});

gulp.task('build', ['sass', 'minify:css', 'webpack']);
gulp.task('default', ['sass', 'minify:css', 'webpack', 'watch']);
