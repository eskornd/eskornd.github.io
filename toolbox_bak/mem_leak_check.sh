#!/bin/bash

BIN=$1
echo export MallocStackLogging=1 && leaks --atExit -- ${BIN}
export MallocStackLogging=1 && leaks --atExit -- ${BIN}

