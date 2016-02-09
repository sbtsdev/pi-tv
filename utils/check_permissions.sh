#!/bin/bash
chown -R deploy:www-data ./
chmod -R 750 ./

# Uploads
chown -R www-data:www-data uploads/
chmod -R 774 uploads/
