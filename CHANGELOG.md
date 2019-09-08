## v1.1.5 (08/09/2019)

### Fixed

* Fixed the configurable role limit when the guild is not defined in the config

## v1.1.4 (03/09/2019)

### Added

* Added configurable role limits to the configuration file - `limits`

### Fixed

* Fixed a bug when the bot sometimes received the reaction role
* Fixed stopping PM2

## v1.1.3 (22/08/2019)

### Added

* Added a new command to display all bot's servers - `[p]servers`

### Changed

* Changed a confusing field text in the `[p]about` command output
* Updated all dependencies (it may fix some rare bugs)

## v1.1.2 (01/08/2019)

### Fixed

* Fixed a rare bug when all reaction roles using a flag as reaction got deleted at once

## v1.1.1 (30/07/2019)

### Added

* Added new steps to the installation to include all necessary information

### Fixed

* Fixed the message about missing permissions by adding client permissions to commands

## v1.1.0 (30/07/2019)

### Added

* Added [Knex](http://knexjs.org/) SQL query builder
* Added ESLint rules
* Added `package-lock.json` back to the repository
* Added scripts to the package file
* Added necessary client permissions to commands

### Removed

* Removed the SQL export file

### Changed

* Updated PM2's version
* Updated installation steps to reflect the newest changes
