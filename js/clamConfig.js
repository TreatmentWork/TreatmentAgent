var config = require('../config/clamAVConfig.json');
var exports = module.exports = clam = require('./clamAVScan.js')({
    remove_infected: config.remove_infected, // If true, removes infected files
    quarantine_infected: config.quarantine_infected, // False: Don't quarantine, Path: Moves files to this place.
    scan_log: config.scan_log, // Path to a writeable log file to write scan results into
    debug_mode: config.debug_mode, // Whether or not to log info/debug/error msgs to the console
    clamscan: {
        path: config.clamscan.path, // Path to clamscan binary
        scan_archives: config.clamscan.scan_archives // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
    }
});
