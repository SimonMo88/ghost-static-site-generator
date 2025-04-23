const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { execSync } = require('child_process');

const { argv } = yargs(hideBin(process.argv));

/**
 * This is the source domain that ghost is hosted on
 * @type {string}
 */
const SOURCE_DOMAIN = (argv.sourceDomain || argv.domain || 'http://localhost:2368').replace(/\/?$/, '');
/**
 * This is the production domain that ghost will be hosted on, ie. your CDN or S3 bucket
 * @type {string}
 */
const PRODUCTION_DOMAIN = (argv.productionDomain || argv.url || SOURCE_DOMAIN).replace(/\/?$/, '');
const IGNORE_ABSOLUTE_PATHS = argv.ignoreAbsolutePaths || false;
const STATIC_DIRECTORY = argv.dest || 'static';
const SAVE_AS_REFERER = argv.saveAsReferer || false;
const USE_WPULL = argv.useWpull || false;
const MIRROR_COMMAND = USE_WPULL ? 'wpull' : 'wget';

const shouldShowProgress = () => {
  if (argv.silent) {
    return '';
  }

  const showProgressHelpText = execSync(
    `${MIRROR_COMMAND} --help | grep "show-progress" || true`,
  ).toString();

  return `${showProgressHelpText}`.includes('show-progress');
};

const OPTIONS = {
  // This is the path of the static directory the your machine
  ABSOLUTE_STATIC_DIRECTORY: path.resolve(
    process.cwd(),
    `${STATIC_DIRECTORY}`,
  ),
  // This is the --dest flag
  STATIC_DIRECTORY,
  // This is the --domain flag
  SOURCE_DOMAIN,
  // This is the --domain flag without http:// or https://
  SOURCE_DOMAIN_WITHOUT_PROTOCOL: SOURCE_DOMAIN.replace(/^https?:\/\//i, ''),
  SOURCE_DOMAIN_PLAIN: SOURCE_DOMAIN.replace(/^https?:\/\//i, '').replace(/:[0-9]+$/, ''),
  // This is the --url flag
  PRODUCTION_DOMAIN,
  // This is the --url flag without http:// or https://
  PRODUCTION_DOMAIN_WITHOUT_PROTOCOL: PRODUCTION_DOMAIN.replace(/^https?:\/\//i, ''),
  PRODUCTION_DOMAIN_PLAIN: PRODUCTION_DOMAIN.replace(/^https?:\/\//i, '').replace(/:[0-9]+$/, ''),
  // The --silent flag determines if we should show the progress bar or not
  SHOW_PROGRESS_BAR: shouldShowProgress()
    ? '--show-progress '
    : '',
  // --ignore-absolute-paths flag will remove all urls
  IGNORE_ABSOLUTE_PATHS,
  // --save-as-referer flag will save redirected assets using the
  // original url path instead of the redirected destination url
  SAVE_AS_REFERER,
  MIRROR_COMMAND,
  PLUGIN_SCRIPT: path.join(path.dirname(path.dirname(__dirname)), 'ghost_domains.py'),
};

module.exports = OPTIONS;
