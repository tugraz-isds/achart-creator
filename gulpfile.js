const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const clean = require('gulp-clean');
const nexe = require('nexe');


const paths = {
  src: './src/',
  ts_build: './src/ts/build/',
  ts_build_js: './src/ts/build/js/ts/',
  ic_build: './src/icons/build/',
  build: './build/',
}

const files = {
  main_js: 'js/ts/achart-creator.js',
  js: 'acreate.js',
  min_js: 'achart-creator.min.js'
}


function deleteBuilds()
{
  return gulp.src(['binaries/', 'build/', 'src/ts/build/'],
  {
    read: false,
    allowEmpty: true
  })
    .pipe(clean());
}


function deleteModules()
{
  return gulp.src('node_modules/',
  {
    read: false,
    allowEmpty: true
  })
    .pipe(clean());
}


function tsc()
{
  const ts_result = gulp.src(paths.src + '**/*.ts')
      .pipe( ts.createProject(require('./tsconfig').compilerOptions)() );
  
  return merge([
      ts_result.dts.pipe( gulp.dest(paths.ts_build + 'd/') ),
      ts_result.js.pipe( gulp.dest(paths.ts_build + 'js/') )
  ]);
}

function aChartCreatorCopy()
{
  return gulp.src(
    [paths.ts_build_js + '*.js'],
    {base: paths.ts_build + 'js/ts'}
  )
      .pipe(gulp.dest(paths.build));
}


function nexeBuild(cb)
{
  
  const target_version = "12.9.1";
  
  let target = target_version;
  let target_dir = process.platform + "-" + process.arch;
  
  if ( (process.argv.length > 4) && (process.argv[3].toLowerCase() === "--target" ) )
  {
    target = process.argv[4];
    target_dir = target;
    
    if (target.indexOf(".") === -1)
    {
      target += "-" + target_version;
    }
  }
  else
  {
    console.info("No output target specified. Creating executable for host platform...");
  }
  
  nexe.compile(
  {
    input: "build/acreate.js",
    output: "binaries/" + target_dir + "/acreate",
    target: target
  });
  
  cb();
}


exports.clean = deleteBuilds;

exports.cleanall = gulp.series(deleteBuilds, deleteModules);

exports.build = gulp.series(tsc, aChartCreatorCopy);

exports.binary = gulp.series(exports.build, nexeBuild);

exports.default = exports.build;
