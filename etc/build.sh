#! /bin/bash -u

cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ..

type svgtoimg >/dev/null 2>&1 || { echo >&2 "svgtoimg not installed.  Aborting."; exit 1; }

tmpfile=$(mktemp /tmp/xload.XXXXXXXXXX)
mkdir -p ext/icons

make_png () {
    # <1:source> <2:color_1> <3:color_2> <4:WxH> <5:target>
    sed "s/fill:#1[0-9a-fA-F]\{5\};/fill:$2/g"   $1 |\
    sed "s/stroke:#1[0-9a-fA-F]\{5\};/stroke:$2/g"    |\
    sed "s/fill:#2[0-9a-fA-F]\{5\};/fill:$3/g"      |\
    sed "s/stroke:#2[0-9a-fA-F]\{5\};/stroke:$3/g"    > $tmpfile
    svgtoimg -g "$4" $tmpfile $5
}

red='#A00000'
green='#008000'
blue='#0000B0'
white='#FFFFFF'
g='128,128'

make_png assets/icon_dots.svg  $green $green  $g ext/icons/icon_128_green.png
make_png assets/icon_dots.svg  $blue  $blue   $g ext/icons/icon_128_blue.png

make_png assets/icon_empty.svg  $green X  $g ext/icons/icon_128_empty.png

make_png assets/icon_dot.svg $green $red $g ext/icons/icon_128_red_dot.png
make_png assets/icon_2dots.svg $green X $g ext/icons/icon_128_2dots.png
make_png assets/icon_na.svg  $red  X  $g ext/icons/icon_128_na.png
make_png assets/icon_err.svg $green $red  $g ext/icons/icon_128_err.png

rm -r $tmpfile
