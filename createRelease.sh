#!/bin/bash

# Create a release branch (release-x.y.z) for deploying the package
# Usage: ./createRelease.sh <version-number>

if [ -z "$1" ]
then
    echo "Usage: ./createRelease.sh <version-number x.y.z>"
    exit 1
fi

if [[ ! "$1" =~ ^([0-9]+)(\.)([0-9]+)(\.)([0-9]+)$ ]]
then
    echo "Given version number is not valid."
    echo "Version number is supposed to be x.y.z"
    echo "You entered $1"
    exit 1;
fi
version=$1

branch_name=$(git symbolic-ref -q HEAD)
branch_name=${branch_name##refs/heads/}
branch_name=${branch_name:-HEAD}

if [ "$branch_name" != "dev" ]
then
    echo "Not in dev-branch, aborting"
    exit 1;
fi

echo "This script will create a release branch from the current branch"
echo "Make sure that the current branch is clean and all changes are commited!"
read -p "Continue? [y/N]: " continue
if [ "$continue" != "y" ] 
then
    echo "Aborting..."
    exit 0
fi

git checkout -b "release-$version"

yarn config set version-git-tag false
cd frontend && yarn version --new-version "$version" cd ../
cd backend && yarn version --new-version "$version" cd ../
echo "$version" > VERSION
git add .

git commit -m "Release $version"
git tag "$version"

git checkout main
git merge -X theirs "release-$version"

read -p "Release created successfully. Push now to origin? [y/N] " pushnow
if [ "$pushnow" == "y" ]
then
    echo "Pushing to origin..."
    git push --tags -u origin main
fi

git checkout dev

echo "Created new tag \"$version\" and merged into main."