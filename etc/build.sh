#! /bin/bash -u

cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ..

type svgtoimg >/dev/null 2>&1 || { echo >&2 "svgtoimg not installed.  Aborting."; exit 1; }

tmpfile=$(mktemp /tmp/xload.XXXXXXXXXX)
mkdir -p ext/icons

sed 's/fill:#[0-9a-fA-F]\{6\};/fill:#800000/g' assets/icon.svg > $tmpfile
svgtoimg -g 128,128 $tmpfile ext/icons/icon_128_red.png

sed 's/fill:#[0-9a-fA-F]\{6\};/fill:#008000/g' assets/icon.svg > $tmpfile
svgtoimg -g 128,128 $tmpfile ext/icons/icon_128_green.png

sed 's/fill:#[0-9a-fA-F]\{6\};/fill:#A0A0A0/g' assets/icon.svg > $tmpfile
svgtoimg -g 128,128 $tmpfile ext/icons/icon_128_pale.png

sed 's/fill:#[0-9a-fA-F]\{6\};/fill:#0000B0/g' assets/icon.svg > $tmpfile
svgtoimg -g 128,128 $tmpfile ext/icons/icon_128_blue.png

rm -r $tmpfile
