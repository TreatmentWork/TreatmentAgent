var exports = module.exports = clam = require('./index.js')({
    remove_infected: false, // If true, removes infected files
    quarantine_infected: false, // False: Don't quarantine, Path: Moves files to this place.
    scan_log: '/tmp/clamAVscan.log', // Path to a writeable log file to write scan results into
    debug_mode: true, // Whether or not to log info/debug/error msgs to the console
    clamscan: {
        path: '/usr/bin/clamscan', // Path to clamscan binary
        scan_archives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
    }
});
