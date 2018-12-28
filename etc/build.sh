#! /bin/bash -u

cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ..

type svgtoimg >/dev/null 2>&1 || { echo >&2 "svgtoimg not installed.  Aborting."; exit 1; }

tmpfile=$(mktemp /tmp/xload.XXXXXXXXXX)
mkdir -p ext/icons

make_png () {
    sed "s/fill:#[0-9a-fA-F]\{6\};/fill:$2/g" $1 |\
        sed "s/stroke:#[0-9a-fA-F]\{6\};/stroke:$2/g" > $tmpfile
    svgtoimg -g "$3" $tmpfile $4
}

make_png assets/icon_na.svg '#A00000' 128,128 ext/icons/icon_128_na.png
make_png assets/icon.svg    '#008000' 128,128 ext/icons/icon_128_green.png
make_png assets/icon.svg    '#0000B0' 128,128 ext/icons/icon_128_blue.png

rm -r $tmpfile
