#!/bin/bash
cd utils/
chown -R deploy:www-data ../../missions-tv/
chmod -R 750 ../../missions-tv/

# Uploads
chown -R www-data:www-data ../uploads/
chmod -R 774 ../uploads/

cd ..
