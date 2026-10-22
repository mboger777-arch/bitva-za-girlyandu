#!/bin/sh
# новая версия кэша: tools/setv.sh 20261019a2
sed -i -E "s/20[0-9]{6}[a-z][0-9]+/$1/g" index.html && echo "V=$1"
