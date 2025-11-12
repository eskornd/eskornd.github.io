#!/bin/bash
JAVA=/opt/homebrew/Cellar/openjdk@21/21.0.8/bin/java
USER=psdbuild

function usage ()
{
	echo "Usage:"
	# echo "	jenkins_delete_builds.sh <jobname> <build range> [labels]"
	echo "	jenkins_delete_builds.sh <jobname> <build range> "
	echo
	echo "Example:"
	#echo "	jenkins_delete_builds.sh testjob 1-100 \"parent Mac vc12 m_eaw12md700\""
	echo "	jenkins_delete_builds.sh testjob 1-100"
	echo
	exit 0
}

if [[ -z $1 ]]; then
	usage
	exit 0
fi

if [[ -z $2 ]]; then
	usage
	exit 0
fi

#if [[ -z $3 ]]; then
#	usage
#	exit 0
#fi

#read -s -p "Enter Password for ${PSDBUILD}: " mypassword
mypassword=compaq

AUTH=" -auth psdbuild:compaq"
#CLI_BASE="${HOME}/bin/java -jar ${HOME}/bin/jenkins-cli.jar ${AUTH} -s http://miniArm01.esko-graphics.com/"
CLI_BASE="${JAVA} -jar ${HOME}/bin/jenkins-cli.jar ${AUTH} -s http://miniArm01.esko-graphics.com/"
CLI_DEL_BUILDS="${CLI_BASE} delete-builds"
#CLI login does not work, don't know why
# to run this script, give the anonymous delete permission on the job first

JOB=$1
BUILDS=$2
# Jenkins now automatically deletes children, no need to specify labels
# LABELS=$3
# LABELS="parent"

CMD=${CLI_DEL_BUILDS}
CMD+=" ${JOB} $BUILDS"
echo $CMD
echo "Remove job label $JOB builds $BUILDS"
echo $DISPLAY_CMD
eval $CMD

# NEW JENKINS DOESN'T REQUIRE LABELS
# for label in $LABELS 
# do
# 	if [ ${label} == "parent" ]; then
# 		CMD=${CLI_DEL_BUILDS}
# 		CMD+=" ${JOB} $BUILDS"
# 		echo $CMD
# 		echo "Remove job label $JOB builds $BUILDS"
# 		echo $DISPLAY_CMD
# 		eval $CMD
# 	else
# 		CMD=${CLI_DEL_BUILDS}
# 		CMD+=" ${JOB}/label=${label} $BUILDS"
# 		echo "Remove job label $JOB/label=${label} builds $BUILDS"
# 		echo $DISPLAY_CMD
# 		eval $CMD
# 	fi
# done




