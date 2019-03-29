DIRECTORY="./Fragments/"
DB="../DB/"
OUTPUT="../JS/Shooter/WebDB.js"

cat ${DIRECTORY}WebDBHead.jsf > ${OUTPUT}

sed -i 's/\r$//' WebDBList.txt 

while read line; do
	echo "\"${line}\":" >> ${OUTPUT}
	cat ${DB}${line}.json >> ${OUTPUT}
	echo "," >> ${OUTPUT}
done < WebDBList.txt

sed -i '$ s/.$//' ${OUTPUT}

cat ${DIRECTORY}WebDBBody.jsf >> ${OUTPUT}
