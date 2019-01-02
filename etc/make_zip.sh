#! /bin/bash -u

zip=dw-new-comments
cd "$( dirname "${BASH_SOURCE[0]}" )"
rm -f ${zip}.zip
cd ../ext
zip -9 -r --exclude=*.DS_Store*  --exclude=*.zip ../etc/$zip .
cd "$( dirname "${BASH_SOURCE[0]}" )"
echo ""
ls -l ${zip}.zip
