FROM php:7.4-apache
COPY www /var/www/html/
EXPOSE 80
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]

# docker build . -t choixpeau
# docker tag choixpeau thecyrion/choixpeau:tagname
# docker push thecyrion/choixpeau:tagname