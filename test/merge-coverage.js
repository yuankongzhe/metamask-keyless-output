const fs = require('fs');
const path = require('path');
const libCoverage = require('istanbul-lib-coverage');
const libReport = require('istanbul-lib-report');
const reports = require('istanbul-reports');
const glob = require('fast-glob');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
// Temporarily commented out as we can't rely on the commented yaml file
// Can be restored when the codecov checks are restored
// const yaml = require('yaml');
const codecovTargets = require('../coverage-targets');

// Temporarily commented out as we can't rely on the commented yaml file
// Can be restored when the codecov checks are restored. In the meantime
// the important parts of the yaml file are copied below in normal js object
// format.
// const codecovConfig = yaml.parse(fs.readFileSync('codecov.yml', 'utf8'));

const codecovConfig = {
  coverage: {
    status: {
      global: {},
      project: {
        transforms: {
          paths: ['development/build/transforms/**/*.js'],
        },
      },
    },
  },
};

const COVERAGE_DIR = './coverage/';

const COVERAGE_THRESHOLD_FOR_BUMP = 1;

/**
 * Load .json file at path and parse it into a javascript object
 *
 * @param {string} filePath - path to the file to load
 * @returns {object} the JavaScript object parsed from the file
 */
function loadData(filePath) {
  const json = fs.readFileSync(filePath);
  return JSON.parse(json);
}

/**
 * Loads an array of json coverage files and merges them into a final coverage
 * report.
 *
 * @param {string[]} files - array of strings that are paths to files
 * @returns {libCoverage.CoverageMap} CoverageMap
 */
function mergeCoverageMaps(files) {
  const coverageMap = libCoverage.createCoverageMap({});

  files.forEach((covergeFinalFile) => {
    coverageMap.merge(loadData(covergeFinalFile));
  });

  return coverageMap;
}

/**
 * Given a target directory and a coverageMap generates a finalized coverage
 * summary report and saves it to the directory.
 *
 * @param {string} dir - target directory
 * @param {libCoverage.CoverageMap} coverageMap - CoverageMap to report on
 * @param reportType
 * @param reportOptions
 */
function generateSummaryReport(dir, coverageMap, reportType, reportOptions) {
  const context = libReport.createContext({
    dir,
    coverageMap,
  });

  reports.create(reportType, reportOptions ?? {}).execute(context);
}

/**
 * Generates a multiline string with coverage data
 *
 * @param {CoverageTarget} target - Target coverage threshold
 * @param {import('istanbul-lib-coverage').CoverageSummaryData} actual -
 *  istanbul coverage summary detailing actual summary
 * @returns {string} multiline report of coverage
 */
function generateConsoleReport(target, actual) {
  const { lines, branches, functions, statements } = actual.data;
  const breakdown =
    `Lines: ${lines.covered}/${lines.total} (${lines.pct}%). Target: ${target.lines}%\n` +
    `Branches: ${branches.covered}/${branches.total} (${branches.pct}%). Target: ${target.branches}%\n` +
    `Statements: ${statements.covered}/${statements.total} (${statements.pct}%). Target: ${target.statements}%\n` +
    `Functions: ${functions.covered}/${functions.total} (${functions.pct}%). Target: ${target.functions}%`;
  return breakdown;
}

/**
 * @typedef {object} CoverageTarget
 * @property {number} lines - percentage of lines that must be covered
 * @property {number} statements - percentage of statements that must be covered
 * @property {number} branches - percentage of branches that must be covered
 * @property {number} functions - percentage of functions that must be covered
 */

/**
 * Checks if the coverage meets target
 *
 * @param {CoverageTarget} target
 * @param {import('istanbul-lib-coverage').CoverageSummaryData} actual
 * @returns {boolean}
 */
function isCoverageInsufficient(target, actual) {
  const lineCoverageNotMet = actual.lines.pct < target.lines;
  const branchCoverageNotMet = actual.branches.pct < target.branches;
  const functionCoverageNotMet = actual.functions.pct < target.functions;
  const statementCoverageNotMet = actual.statements.pct < target.statements;
  return (
    lineCoverageNotMet ||
    branchCoverageNotMet ||
    functionCoverageNotMet ||
    statementCoverageNotMet
  );
}

/**
 * Checks if the coverage should be bumped up
 *
 * @param {CoverageTarget} target
 * @param {import('istanbul-lib-coverage').CoverageSummaryData} actual
 * @returns {boolean}
 */
function shouldCoverageBeBumped(target, actual) {
  const lineCoverageNeedsBumped =
    actual.lines.pct > target.lines + COVERAGE_THRESHOLD_FOR_BUMP;
  const branchCoverageNeedsBumped =
    actual.branches.pct > target.branches + COVERAGE_THRESHOLD_FOR_BUMP;
  const functionCoverageNeedsBumped =
    actual.functions.pct > target.functions + COVERAGE_THRESHOLD_FOR_BUMP;
  const statementCoverageNeedsBumped =
    actual.statements.pct > target.statements + COVERAGE_THRESHOLD_FOR_BUMP;
  return (
    lineCoverageNeedsBumped ||
    branchCoverageNeedsBumped ||
    functionCoverageNeedsBumped ||
    statementCoverageNeedsBumped
  );
}

/**
 * Creates and returns a combined coverage summary report of every file in the
 * provided array.
 *
 * @param {string[]} files - array of files generated by fast-glob
 * @param {libCoverage.CoverageMap} coverageMap
 * @returns {import('istanbul-lib-coverage').CoverageSummaryData}
 */
function getFileCoverage(files, coverageMap) {
  const subCoverageMap = libCoverage.createCoverageMap({});

  files.forEach((file) => {
    try {
      subCoverageMap.merge(
        coverageMap.fileCoverageFor(`${process.cwd()}/${file}`),
      );
    } catch {
      // If the coverage doesn't exist, it means that it was excluded from
      // coverage or had no coverage to report, which is fine. Glob is a lot
      // wider of a net then what the test file runners match against.
    }
  });

  const summary = subCoverageMap.getCoverageSummary();
  return summary;
}

/**
 * Checks coverage and reports to console
 * Throws an error if coverage isn't met
 *
 * @param {string} name - The target's name from coverageThresholds in jest
 *  config
 * @param {CoverageTarget} target - the target coverage threshold
 * @param {import('istanbul-lib-coverage').CoverageSummaryData} actual -
 *  istanbul coverage summary representing actual coverage
 */
function checkCoverage(name, target, actual) {
  const breakdown = generateConsoleReport(target, actual);
  if (isCoverageInsufficient(target, actual)) {
    const errorMsg = `Coverage thresholds for ${name} NOT met\n${breakdown}`;
    throw new Error(errorMsg);
  } else if (shouldCoverageBeBumped(target, actual)) {
    const errorMsg = `Coverage EXCEEDS threshold for ${name} and must be bumped\n${breakdown}`;
    throw new Error(errorMsg);
  }
  console.log(`Coverage thresholds for ${name} met\n${breakdown}\n\n`);
}

/**
 * Primary script function
 */
async function start() {
  const {
    argv: { html },
  } = yargs(hideBin(process.argv)).usage(
    '$0 [options]',
    'Run unit tests on the application code.',
    (yargsInstance) =>
      yargsInstance
        .option('html', {
          alias: ['h'],
          default: false,
          description: 'Generate HTML report',
          type: 'boolean',
        })
        .strict(),
  );
  // First get all of the files matching the pattern coverage-final-${n}.json
  // from the coverage directory
  const files = fs.readdirSync(COVERAGE_DIR);
  const filePaths = files
    .filter(
      (file) =>
        path.basename(file).startsWith('coverage-final') &&
        path.extname(file) === '.json',
    )
    .map((file) => path.join(COVERAGE_DIR, file));

  // Next, generate a coverageMap
  const coverageMap = mergeCoverageMaps(filePaths, true);

  // Persist this to file, which may eventually be used in more steps
  generateSummaryReport(COVERAGE_DIR, coverageMap, 'json-summary');
  if (html) {
    generateSummaryReport(COVERAGE_DIR, coverageMap, 'html');
  }

  // Use the keys in coverageThreshold in jest config to determine targets
  const coverageTargets = Object.keys(codecovConfig.coverage.status.project);

  // Check coverage totals for each target
  coverageTargets.forEach((target) => {
    const summary =
      target === 'global'
        ? coverageMap.getCoverageSummary()
        : getFileCoverage(
            glob.sync([
              ...codecovConfig.coverage.status.project[target].paths,
              // checking test file coverage is redundant.
              '!**/*.test.js',
              '!**/__mocks__/**/*.js',
              '!**/*.stories.*',
            ]),
            coverageMap,
          );
    // Check and validate the coverage
    checkCoverage(target, codecovTargets[target], summary);
  });
}

start().catch((error) => {
  // Report the errored coverage check
  console.error(error);
  process.exit(1);
});
