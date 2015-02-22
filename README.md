# rdsing

A tiny node-based tool written in ES6 to boot up an RDS instance from its latest
snapshot, wait for it to become available, and modify the instance to add
security groups.

It's fairly specialized and is designed particularly to enable processes that
boot up RDS snapshots for dumping into other databases. The feature set could
be substantially expanded if there is a use for it.

## USAGE

```
$ rdsing --help

Usage: rdsing <command>

command
  restore     Restore the latest RDS snapshot available.
  destroy     Delete an RDS instance.
```

There are two commands, one for restoring and one for deletion:

```
$ rdsing restore --help

Usage: rdsing restore [options]

Options:
   --debug              Print stuff.  [false]
   -r, --region         AWS region to use.  [us-east-1]
   -n, --name           Name of the target.
   -d, --dbname         Database name in the restored instance.
   -m, --multiaz        Use multiple availability zones.  [false]
   -i, --iops           Number of iops to provision. Default is the same as the snapshot.
   -t, --instancetype   Instance type to use. Default is the same as the snapshot.
   -p, --port           Port number to use. Default is the same as the snapshot.
   -g, --group          Security groups to add to the instance...

Restore the latest RDS snapshot available.

$ rdsing destroy --help

Usage: rdsing destroy [options]

Options:
   -s, --snapshot   If specified, creates a final snapshot with this name.
   --debug          Print stuff.  [false]
   -r, --region     AWS region to use.  [us-east-1]
   -n, --name       Name of the target.

Delete an RDS instance.
```

When using restore, the project will wait until the instance becomes available,
and if modification is necessary it'll wait for that to finish too. No progress
output is printed unless `--debug` is specified. Without `--debug`, only the
final instance JSON blob will be printed, to make it easy to call from other
programs.

## Design

Rdsing is designed as a functional promise pipeline of sorts. Operations to
perform with AWS are curried functions that return a promise and those are
piped together to perform operations.
