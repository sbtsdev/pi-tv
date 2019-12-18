# Pi-TV
Simple idea, display slider-like images in two formats. One is a full image page. The other is image on top and numbers below with the estimated current world population and the estimated number of people who have not had an adequate chance to hear the gospel.

A simple admin front-end is also supplied to allow users to easily add images to the already-running site.

## Config
The `ws/config.php` file is required. If it is not present the following error will arise:
    PHP Warning:  require(config.php): failed to open stream: No such file or directory

There is a `config.php.example` in the `ws` directory as a template to create a `config.php` file for simple settings.

Note that the admin/.htaccess file contains a link to a passwords file not included in the repository. To create a file like it use "htpasswd -c /path/to/your/version/bevins_passwords someUserName" at the terminal. This file is used to provide security to the admin side.

TODO: include https://freek.dev/797-easily-optimize-images-using-php-and-some-binaries to first optimize the images and then check the size.
