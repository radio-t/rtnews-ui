FROM node:4.2.3

ENV DISQUS=test \
    APIPATH=/api

RUN \
 mkdir -p /var/www && \
 git clone https://github.com/igoradamenko/rtnews-ui.git /srv/rtnews-ui && \
 cd /srv/rtnews-ui && \
 npm i -g gulp && \
 npm i && \
 gulp build && \
 mv ./public /var/www/webapp

CMD \
 sed -i 's|radiotnewstest|'"$DISQUS"'|g' /var/www/webapp/js/main.js && \
 sed -i 's|http://master.radio-t.com:8780/api/v1|'"$APIPATH"'|g' /var/www/webapp/js/main.js && \
 sed -i 's|https://news.radio-t.com/api/v1|'"$APIPATH"'|g' /var/www/webapp/js/main.js && \
 cat /var/www/webapp/js/main.js
 
