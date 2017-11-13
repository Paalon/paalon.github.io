#!/bin/bash
find . -name "*.md" | while read file
do
    pandoc -f markdown -t html $file > ${file%.*}.html
done
