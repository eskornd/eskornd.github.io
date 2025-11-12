
CL=$1
P4CLIENT=nexu_l_kit
BRANCH=ps22A1_release_full

echo 
CMD="p4 -c ${P4CLIENT} integrate -b ${BRANCH}  -s //...@${CL},@${CL}"
echo $CMD

echo
CMD="p4 -c ${P4CLIENT} resolve -as"
echo $CMD


DESC=`p4 describe -s ${CL} | grep "Affected files ..." -B 100 | tail -n +3 | sed '$d' | sed '$d' | sed 's|"|\\\\"|g'`

echo
CMD="p4 -c ${P4CLIENT} submit -d \"[Release Photoshop 22A1] Merge ${CL} ${DESC}\""
echo ${CMD}
echo
