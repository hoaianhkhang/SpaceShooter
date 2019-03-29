DIRECTORY="./Fragments/"
OUTPUT_DIRECTORY="../"

ABBREVIATION=""

case $1 in
	"-w")
		ABBREVIATION="Web"
	;;
	"-p")
		ABBREVIATION="PC"
	;;
	"-m")
		ABBREVIATION="Mobile"
	;;
	*)
	;;
esac

if [ $ABBREVIATION = "" ]; then
	echo "Please specify a build platform."
else
	cat ${DIRECTORY}UniversalHeader.htmlf ${DIRECTORY}UniversalScripts.htmlf ${DIRECTORY}${ABBREVIATION}Scripts.htmlf ${DIRECTORY}UniversalBody.htmlf > ${OUTPUT_DIRECTORY}${ABBREVIATION}Index.html
fi
