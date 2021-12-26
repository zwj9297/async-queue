var gulp = require('gulp')
var clean = require('gulp-clean')
var ts = require('gulp-typescript')
var uglify = require('gulp-uglify')
var rename = require('gulp-rename')
var babel = require('gulp-babel')

const distSrc = 'dist'
const basename = 'sync-queue'

/** 删除dist目录 */
gulp.task('clean', () => {
  return gulp
    .src(distSrc, { read: false, allowEmpty: true })
    .pipe(clean(distSrc))
})

/** 生成声明文件 */
gulp.task('tsc', () => {
  return gulp
    .src(['es/index.ts'])
    .pipe(
      ts({
        /** 针对每个ts文件生成.js和d.ts */
        declaration: true,
        target: 'es6',
      })
    )
    .pipe(
      rename((file) => {
        file.basename = basename
        if (file.extname === '.js') {
          file.basename += '.esm'
        } else if (file.extname === '.ts') {
          file.basename += '.d'
        }
      })
    )
    .pipe(gulp.dest(distSrc))
})

gulp.task('babel', () => {
  return gulp
    .src(`${distSrc}/${basename}.esm.js`)
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
        plugins: ['@babel/transform-runtime'],
      })
    )
    .pipe(
      rename({
        basename,
        suffix: '.cjs',
      })
    )
    .pipe(gulp.dest(distSrc))
    .pipe(uglify())
    .pipe(
      rename({
        basename,
        suffix: '.cjs.min',
      })
    )
    .pipe(gulp.dest(distSrc))
})

gulp.task(
  'default',
  gulp.series(
    gulp.parallel('clean'),
    gulp.parallel('tsc'),
    gulp.parallel('babel')
  )
)
