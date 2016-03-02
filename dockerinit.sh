#!/bin/bash
sed -i 's|radiotnewstest|'"$DISQUS"'|g' /var/www/webapp/js/main.js
sed -i 's|http://master.radio-t.com:8780/api/v1|'"$APIPATH"'|g' /var/www/webapp/js/main.js
sed -i 's|https://news.radio-t.com/api/v1|'"$APIPATH"'|g' /var/www/webapp/js/main.js
$@
