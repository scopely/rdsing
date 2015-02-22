#!/usr/bin/env node
"use babel";

import AWS from 'aws-sdk';
import opts from "nomnom";
import _ from "lodash";
import moment from "moment";
import "babel/polyfill";

/**
 * Print an error message and exit with code 1.
 * @param  {Error} err Error we're failing for.
 */
function die(err) {
  console.error(`An error occured! ${err.message}`);
  process.exit(1);
}

function latestSnapshot(rds, name) {
  return new Promise(resolve => {
    rds.describeDBSnapshots({
      DBInstanceIdentifier: name
    }, (err, data) => {
      if (err) die(err);
      let snapshots = _.sortBy(data.DBSnapshots, 'SnapshotCreateTime');
      resolve(_.last(snapshots));
    });
  });
}

let restoreSnapshot = _.curry((rds, opts, snapshot) => {
  if (opts.debug)
    console.log("Restoring the latest snapshot available...");

  return new Promise(resolve => {
    // Generate instance identifier.
    let timestamp = moment().format('X');
    let instance = `${snapshot.DBInstanceIdentifier}-rdsing-${timestamp}`;

    rds.restoreDBInstanceFromDBSnapshot({
      DBInstanceIdentifier: instance,
      DBSnapshotIdentifier: snapshot.DBSnapshotIdentifier,
      DBInstanceClass: opts.instancetype,
      DBName: opts.dbname,
      Port: opts.port || snapshot.Port,
      Iops: opts.iops || snapshot.Iops,
      StorageType: snapshot.StorageType
    }, (err, data) => {
      if (err) die(err);
      resolve(data.DBInstance);
    });
  });
});

let waitForInstance = _.curry((rds, opts, instance) => {
  if (opts.debug)
    console.log("Waiting for the instance to become available...")

  return new Promise(resolve => {
    var interval = setInterval(() => {
      rds.describeDBInstances({
        DBInstanceIdentifier: instance.DBInstanceIdentifier
      }, (err, data) => {
        instance = data.DBInstances[0];
        let status = instance.DBInstanceStatus;
        if (opts.debug) console.log(status);
        if (status === 'available') {
          clearInterval(interval);
          resolve(instance);
        };
      });
    }, 30000);
  });
});

let addSecurityGroups = _.curry((rds, opts, instance) => {
  return new Promise(resolve => {
    if (opts.group.length != -1 ) {
      if (opts.debug) console.log(`Adding security groups ${opts.group}`);
      rds.modifyDBInstance({
        DBInstanceIdentifier: instance.DBInstanceIdentifier,
        DBSecurityGroups: opts.group
      }, (err, data) => {
        if (err) die(err);
        resolve(data);
      });
    } else {
      resolve(instance);
    }
  });
});

/**
 * Restore a db instance.
 * @param  {Object} opts Options from nomnom.
 */
function restore(opts) {
  let rds = new AWS.RDS({region: opts.region});
  latestSnapshot(rds, opts.name)
    .then(restoreSnapshot(rds, opts))
    .then(waitForInstance(rds, opts))
    .then(addSecurityGroups(rds, opts))
    .then(waitForInstance(rds, opts))
    .then(console.log);
}

function destroy() {
  // TODO
}

/**
 * Parse commands and their args with nomnom.
 * @returns {Object}
 */
function parseArgs() {
  let standardOpts = {
    debug: {
      default: false,
      flag: true,
      help: "Print stuff."
    },
    region: {
      abbr: 'r',
      default: 'us-east-1',
      required: true,
      help: "AWS region to use."
    },
    name: {
      abbr: 'n',
      required: true,
      help: "Name of the target."
    }
  };

  opts.script('rdsing');

  opts.command('restore')
    .callback(restore)
    .options(_.merge(standardOpts, {
      dbname: {
        abbr: 'd',
        help: "Database name in the restored instance."
      },
      multiaz: {
        abbr: 'm',
        flag: true,
        'default': false,
        help: "Use multiple availability zones."
      },
      iops: {
        abbr: 'i',
        help: "Number of iops to provision. Default is the same as the snapshot."
      },
      instancetype: {
        abbr: 't',
        help: "Instance type to use. Default is the same as the snapshot."
      },
      port: {
        abbr: 'p',
        help: "Port number to use. Default is the same as the snapshot."
      },
      group: {
        abbr: 'g',
        help: "Security groups to add to the instance...",
        list: true
      }
    }))
    .help("Restore the latest RDS snapshot available.");

  opts.command('destroy')
    .callback(destroy)
    .options(standardOpts)
    .help("Delete an RDS instance.");

  return opts.parse();
}

parseArgs();
