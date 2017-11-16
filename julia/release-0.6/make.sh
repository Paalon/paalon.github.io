#!/bin/bash
find . -name "*.md" | while read file
do
    pandoc $file -s --self-contained -t html5 -c github.css -o ${file%.*}.html
done
