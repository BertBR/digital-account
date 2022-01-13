#!/usr/bin/env bash
#
echo "- Checking docker..."
if ! command -v docker &> /dev/null
then
    echo "MISSING DEPENDENCY: docker is not installed"
    exit 1
fi

#docker-compose validation
echo "- Checking docker-compose..."
if ! command -v docker-compose &> /dev/null
then
    echo "MISSING DEPENDENCY: docker-compose is not installed"
    exit 1
fi