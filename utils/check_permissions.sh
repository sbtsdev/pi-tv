#!/bash/sh
chown -R deploy:www-data ../../missions-tv/
chmod -R 750 ../../missions-tv/

# Uploads
chown -R www-data:www-data ../uploads/
chmod -R 666 ../uploads/
