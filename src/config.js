'use strict';

/**
 * ### Agency Configuration
 * This module will read agency configuration files and provide the
 * configuration properties.
 * @module config
 */


const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');


// DEFAULT CONFIGURATION FILE
const defaultLocation = './agency.json';


// AGENCY CONFIGURATION VARIABLES
let CONFIG = {};



/**
 * Read the configuration file from the specified path and merge its properties
 * with the default configuration file.
 * @param {string} modDir Path to the implementing agency's module directory
 * @param {string} location Path to agency config file (relative paths are relative to module root)
 */
function read(modDir, location) {
  if ( modDir !== undefined && location !== undefined ) {

    // Relative paths are relative to the module's root directory
    if ( _isRelativePath(location) ) {
      location = _makeAbsolutePath(modDir, "/../" + location);
    }
    console.log('--> Reading Agency Config File: ' + location);

    // Read new config file
    let add = JSON.parse(fs.readFileSync(location, 'utf8'));

    // Parse relative paths relative to file location
    add = _parseConfig(add, path.dirname(location));

    // Merge configs
    CONFIG = merge(CONFIG, add, {
      arrayMerge: function (d, s) {
        return d.concat(s);
      }
    });

  }
}


/**
 * Get the agency configuration variables
 * @returns {object} Agency config variables
 */
function get() {
  return CONFIG;
}


/**
 * Clear any saved config information and reload the default configuration.  Any
 * previously added config files will have to be read again.
 * @param {string} modDir Path to the implementing agency's module directory
 */
function reset(modDir) {
  CONFIG = {};
  read(modDir, defaultLocation);
}





/**
 * Check if the directory is a relative path
 * @param {string} directory Path to directory
 * @return {boolean} True if the directory is a relative path
 * @private
 */
function _isRelativePath(directory) {
  if ( directory.charAt(0) === '.' ) {
    if ( directory.charAt(1) === '/' ) {
      return true;
    }
    if ( directory.charAt(1) === '.' ) {
      if ( directory.charAt(2) === '/' ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Change a relative path to an absolute path (relative to the specified directory)
 * @param {string} directory The directory to base the relative path off of
 * @param {string} relativePath The relative path to make absolute
 * @returns {string} The absolute path
 * @private
 */
function _makeAbsolutePath(directory, relativePath) {
  return path.normalize(
    path.join(directory, '/', relativePath)
  );
}

/**
 * Parse the Agency Configuration.  This converts any values that are
 * relative paths to absolute paths (relative to the specified directory)
 * @param {Object} object The Agency configuration object
 * @param {string} directory The directory paths are relative to
 * @returns {object} a parsed configuration object
 * @private
 */
function _parseConfig(object, directory) {
  let rtn = {};

  // Parse all of the properties in the object
  for (let property in object) {
    if (object.hasOwnProperty(property)) {
      let value = object[property];

      // If the property's value is an object, recurse another level
      if ( typeof value === 'object' ) {
        rtn[property] = _parseConfig(value, directory);
      }

      // Parse the property's value
      else {
        rtn[property] = _parseConfigValue(value, directory);
      }

    }
  }

  return rtn;
}

/**
 * Parse the configuration value (check for relative paths)
 * @param {*} value configuration value
 * @param {string} directory The directory paths are relative to
 * @returns {*} parsed configuration value
 * @private
 */
function _parseConfigValue(value, directory) {
  if ( _isRelativePath(value) ) {
    value = _makeAbsolutePath(directory, value);
  }
  return value;
}




// Export Functions
module.exports = {
  read: read,
  get: get,
  reset: reset
};